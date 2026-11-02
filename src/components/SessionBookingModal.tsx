"use client";
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, getDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getAnonClientHeaders, isOpsDebugEnabled } from '@/lib/anonClientToken';
import { getOpsTelemetryFromInvoke } from '@/lib/opsTelemetry';
import { toast } from 'sonner';
import { z } from 'zod';
import { computeOriveMatchingFee, formatMoneyWithSymbol, parsePriceString } from '@/lib/pricing';
import { PriceBreakdown } from '@/components/PriceBreakdown';

interface SessionBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  sessionPrice: string;
  sessionDuration?: number;
  facilitatorId: string;
  facilitatorName: string;
  facilitatorEmail?: string;
  isClaimed?: boolean;
  /** For events with fixed dates - skips calendar step */
  eventStartAt?: string | null;
  /** Event capacity (max attendees) */
  eventCapacity?: number | null;
  /** Offering ID for fetching booking count */
  offeringId?: string;
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  // This modal uses a public RPC for availability; slots returned are implicitly available.
  is_available?: boolean;
}

interface Booking {
  booking_date: string;
  booking_time: string;
  duration: number;
  status: string;
}

// Generate time slots between start and end time
function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
}

// Default inquiry time slots for unclaimed or flexible facilitators
const DEFAULT_INQUIRY_SLOTS = [
  '09:00', '10:00', '11:00', '12:30',
  '14:00', '15:30', '16:30', '17:30', '18:30'
];

// Validation schema
const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  phone: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

export function SessionBookingModal({
  open,
  onOpenChange,
  sessionTitle,
  sessionPrice,
  sessionDuration = 60,
  facilitatorId,
  facilitatorName,
  facilitatorEmail,
  isClaimed = false,
  eventStartAt,
  eventCapacity,
  offeringId,
}: SessionBookingModalProps) {
  // Check if this is a fixed-date event
  const isFixedDateEvent = Boolean(eventStartAt);
  const parsedEventDate = useMemo(() => {
    if (!eventStartAt) return null;
    return new Date(eventStartAt);
  }, [eventStartAt]);
  const [step, setStep] = useState<'datetime' | 'details' | 'success'>(
    isFixedDateEvent ? 'details' : 'datetime'
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    parsedEventDate ?? undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    parsedEventDate ? format(parsedEventDate, 'HH:mm') : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Sync state when modal opens with event data
  useEffect(() => {
    if (open && isFixedDateEvent && parsedEventDate) {
      setStep('details');
      setSelectedDate(parsedEventDate);
      setSelectedTime(format(parsedEventDate, 'HH:mm'));
    } else if (open && !isFixedDateEvent) {
      setStep('datetime');
    }
  }, [open, isFixedDateEvent, parsedEventDate]);
  
  // Availability data
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [telemetryPolicy, setTelemetryPolicy] = useState<string | null>(null);
  
  // Event capacity tracking (remaining spots fetched via secure RPC)
  const [remainingSpots, setRemainingSpots] = useState<number | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  
  const isSoldOut = remainingSpots === 0;
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time field validation
  const validateField = (field: string, value: string) => {
    try {
      if (field === 'name') {
        z.string().trim().min(2, 'Name must be at least 2 characters').max(100).parse(value);
      } else if (field === 'email') {
        z.string().trim().email('Please enter a valid email').max(255).parse(value);
      }
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  // Check if field is valid (for showing success state)
  const isFieldValid = (field: string, value: string): boolean => {
    if (!touched[field] || !value.trim()) return false;
    try {
      if (field === 'name') {
        z.string().trim().min(2).max(100).parse(value);
        return true;
      } else if (field === 'email') {
        z.string().trim().email().max(255).parse(value);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  // Fetch availability when modal opens
  useEffect(() => {
    if (open && facilitatorId) {
      fetchAvailability();
    }
  }, [open, facilitatorId]);

  // Fetch remaining spots for events with capacity via secure RPC
  useEffect(() => {
    const fetchRemainingSpots = async () => {
      if (!open || !offeringId || !isFixedDateEvent || eventCapacity == null) {
        setRemainingSpots(null);
        return;
      }
      
      setLoadingCapacity(true);
      try {
        // Use secure RPC function that bypasses RLS to count bookings
        const { data, error } = await supabase
          .rpc('get_offering_remaining_spots', { p_offering_id: offeringId });
        
        if (!error && data != null) {
          setRemainingSpots(data);
        } else {
          // Fallback to capacity if RPC fails
          setRemainingSpots(eventCapacity);
        }
      } catch (e) {
        console.warn('Failed to fetch remaining spots:', e);
        setRemainingSpots(eventCapacity);
      } finally {
        setLoadingCapacity(false);
      }
    };
    
    fetchRemainingSpots();
  }, [open, offeringId, isFixedDateEvent, eventCapacity]);

  // Clear selected time when date changes
  useEffect(() => {
    setSelectedTime(undefined);
  }, [selectedDate]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      // Fetch facilitator availability via backend function with rate limiting.
      const resp: any = await supabase.functions.invoke('get-public-availability', {
        body: { facilitatorId },
        headers: getAnonClientHeaders(),
      });

      const data = resp?.data;
      const slotsError = resp?.error;
      const headerRemaining = resp?.response?.headers?.get?.('X-RateLimit-Remaining');
      if (typeof headerRemaining === 'string' && headerRemaining.length) {
        const n = Number(headerRemaining);
        setRateLimitRemaining(Number.isFinite(n) ? n : null);
      }

      const slots = data?.slots;

      if (slotsError) {
        console.error('Error fetching availability:', slotsError);
      } else {
        // Normalize shape used throughout this component.
        const normalized = (slots || []).map((s: any) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: true,
        })) as AvailabilitySlot[];
        setAvailabilitySlots(normalized);
      }

      // Fetch existing bookings for the next 60 days
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 60);

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_date, booking_time, duration, status')
        .eq('facilitator_id', facilitatorId)
        .gte('booking_date', format(today, 'yyyy-MM-dd'))
        .lte('booking_date', format(futureDate, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      } else {
        setExistingBookings(bookings || []);
      }
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Get available days of week from availability slots
  const availableDaysOfWeek = useMemo(() => {
    return new Set(availabilitySlots.map(slot => slot.day_of_week));
  }, [availabilitySlots]);

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return availableDaysOfWeek.has(dayOfWeek);
  };

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = getDay(selectedDate);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Get availability for this day of week
    const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) {
      // Fallback: if no availability set, show default slots
      return generateTimeSlots('09:00', '18:00', 30);
    }

    // Generate all possible time slots from availability
    let allSlots: string[] = [];
    daySlots.forEach(slot => {
      const slots = generateTimeSlots(slot.start_time, slot.end_time, 30);
      allSlots = [...allSlots, ...slots];
    });

    // Remove duplicates and sort
    allSlots = [...new Set(allSlots)].sort();

    // Filter out already booked slots
    const bookedTimes = existingBookings
      .filter(b => b.booking_date === dateStr)
      .map(b => b.booking_time.substring(0, 5)); // Get HH:MM format

    return allSlots.filter(slot => !bookedTimes.includes(slot));
  }, [selectedDate, availabilitySlots, existingBookings]);

  const sessionPricing = useMemo(() => {
    const parsed = parsePriceString(sessionPrice);
    if (parsed.amount === null) return null;
    const totalInclTax = parsed.amount;
    const fee = computeOriveMatchingFee(totalInclTax);
    return {
      currencySymbol: parsed.currencySymbol,
      totalInclTax,
      fee,
      amountDue: totalInclTax + fee,
    };
  }, [sessionPrice]);

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setStep('details');
  };

  const validateForm = () => {
    try {
      bookingSchema.parse({ name, email, phone, notes });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const isUnclaimedOrInquiry = useMemo(() => {
    return !isClaimed || availabilitySlots.length === 0 || facilitatorId.startsWith('fac-') || isNaN(Number(facilitatorId));
  }, [isClaimed, availabilitySlots, facilitatorId]);

  const handleSubmitBooking = async () => {
    if (!validateForm()) return;
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const bookingDateStr = format(selectedDate, 'yyyy-MM-dd');

      // 1. If facilitator is unclaimed or has no rigid RPC slots, dispatch automated outreach
      if (isUnclaimedOrInquiry) {
        const resp = await fetch('/api/facilitator/booking-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilitatorId,
            facilitatorName,
            sessionTitle,
            sessionPrice,
            sessionDuration,
            preferredDate: bookingDateStr,
            preferredTime: selectedTime,
            clientName: name.trim(),
            clientEmail: email.trim(),
            clientPhone: phone.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.error || 'Buchungsanfrage konnte nicht übermittelt werden.');
        }

        if (data?.inquiryId || data?.bookingId) {
          setCreatedBookingId(data.inquiryId || data.bookingId);
        }

        setStep('success');
        toast.success(data?.message || 'Anfrage gespeichert. Das ist keine Buchung.');
        return;
      }

      // 2. Standard RPC flow for claimed facilitators with existing live database slots
      const resp: any = await supabase.functions.invoke('create-booking', {
        body: {
          facilitatorId,
          offeringId: offeringId || null,
          bookingDate: bookingDateStr,
          bookingTime: selectedTime,
          duration: sessionDuration,
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientPhone: phone.trim() || null,
          notes: notes.trim() || null,
        },
        headers: getAnonClientHeaders(),
      });

      const data = resp?.data;
      const err = resp?.error;
      const status = resp?.response?.status ?? err?.status;

      const telemetry = getOpsTelemetryFromInvoke(resp, {
        bodyRemaining: data?.rateLimitRemaining,
      });
      setRateLimitRemaining(telemetry.remaining);
      setRetryAfterSeconds(telemetry.retryAfterSeconds);
      setTelemetryPolicy(telemetry.policy);

      if (err) {
        if (status === 429) {
          toast.error('Zu viele Anfragen. Bitte versuchen Sie es später erneut.');
          return;
        }
        // Fallback to inquiry dispatch if RPC errors out
        console.warn('RPC create-booking failed, falling back to booking-inquiry dispatch:', err);
        const fallbackResp = await fetch('/api/facilitator/booking-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilitatorId,
            facilitatorName,
            sessionTitle,
            sessionPrice,
            sessionDuration,
            preferredDate: bookingDateStr,
            preferredTime: selectedTime,
            clientName: name.trim(),
            clientEmail: email.trim(),
            clientPhone: phone.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        });
        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          if (fallbackData?.inquiryId || fallbackData?.bookingId) {
            setCreatedBookingId(fallbackData.inquiryId || fallbackData.bookingId);
          }
          setStep('success');
          toast.success(fallbackData?.message || 'Anfrage gespeichert. Das ist keine Buchung.');
          return;
        }
        toast.error(data?.error || 'Fehler beim Erstellen der Buchung.');
        return;
      }

      if (data?.booking?.id || data?.id) {
        setCreatedBookingId(data?.booking?.id || data?.id);
      }
      setStep('success');
      toast.success('Buchung angefragt! Bestätigung per E-Mail.');
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error(error.message || 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    // Reset to appropriate initial step based on event type
    setStep(isFixedDateEvent ? 'details' : 'datetime');
    setSelectedDate(parsedEventDate ?? undefined);
    setSelectedTime(parsedEventDate ? format(parsedEventDate, 'HH:mm') : undefined);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setErrors({});
    setTouched({});
    onOpenChange(false);
  };

  // Resolved time slots: if database availability returned slots, use them; otherwise use popular inquiry slots
  const displayedTimeSlots = useMemo(() => {
    if (availableTimeSlots.length > 0) return availableTimeSlots;
    return DEFAULT_INQUIRY_SLOTS;
  }, [availableTimeSlots]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl rounded-2xl">
        {step === 'datetime' && (
          <div className="p-6 space-y-5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Session buchen
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {sessionTitle} · <span className="text-slate-900 dark:text-white font-bold">{facilitatorName}</span>
              </p>

              {isOpsDebugEnabled() && (rateLimitRemaining !== null || retryAfterSeconds !== null || telemetryPolicy !== null) && (
                <p className="text-xs text-gray-400">
                  Ops: remaining {rateLimitRemaining ?? "—"}
                  {retryAfterSeconds !== null ? ` · retry-after ${retryAfterSeconds}s` : ""}
                  {telemetryPolicy ? ` · ${telemetryPolicy}` : ""}
                </p>
              )}
            </DialogHeader>

            {/* Date Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Datum auswählen
                </Label>
                {selectedDate && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    {format(selectedDate, 'EEEE, d. MMMM yyyy')}
                  </span>
                )}
              </div>
              <div className="flex justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/[0.02] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)]">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    // Disable past dates
                    if (date < today) return true;
                    // If we have live availability data from RPC, only enable days with availability
                    if (!isUnclaimedOrInquiry && availabilitySlots.length > 0) {
                      return !isDateAvailable(date);
                    }
                    // For inquiry mode, all future dates are selectable!
                    return false;
                  }}
                  className="p-1 pointer-events-auto w-full max-w-[340px]"
                  classNames={{
                    months: "space-y-3",
                    month: "space-y-3",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-bold text-slate-900 dark:text-white tracking-wide",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-slate-200/80 dark:border-white/15 rounded-lg transition-all inline-flex items-center justify-center text-slate-700 dark:text-slate-200 backdrop-blur-sm shadow-xs"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "grid grid-cols-7 mb-1 text-center",
                    head_cell: "text-slate-500 dark:text-slate-400 font-semibold text-xs text-center h-8 flex items-center justify-center",
                    row: "grid grid-cols-7 mt-1 gap-1",
                    cell: "h-9 w-9 p-0 text-center text-sm relative flex items-center justify-center mx-auto",
                    day: cn(
                      "h-9 w-9 p-0 font-medium text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg transition-all flex items-center justify-center text-sm cursor-pointer",
                      "aria-selected:bg-gradient-to-r aria-selected:from-[#00CDAC] aria-selected:to-[#02AAB0] aria-selected:text-white aria-selected:hover:from-[#00CDAC] aria-selected:hover:to-[#02AAB0] aria-selected:shadow-md aria-selected:shadow-emerald-500/25"
                    ),
                    day_selected: "bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] text-white hover:from-[#00CDAC] hover:to-[#02AAB0] font-bold shadow-md shadow-emerald-500/25",
                    day_today: "border-2 border-[#00CDAC] text-[#00CDAC] font-bold bg-[#00CDAC]/10 backdrop-blur-sm",
                    day_outside: "text-slate-400/40 dark:text-white/20 opacity-40",
                    day_disabled: "text-slate-300 dark:text-white/15 cursor-not-allowed opacity-30",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Uhrzeit / Zeitfenster wählen
                  {loadingAvailability && (
                    <Loader2 className="inline-block w-3 h-3 ml-2 animate-spin text-emerald-500" />
                  )}
                </Label>
                {selectedTime && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    Ausgewählt: {selectedTime} Uhr
                  </span>
                )}
              </div>

              {selectedDate ? (
                displayedTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 p-1">
                    {displayedTimeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "h-10 px-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center border",
                            isSelected
                              ? "bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] text-white border-[#00CDAC] shadow-md shadow-emerald-500/30 scale-[1.02] ring-2 ring-[#00CDAC]/40"
                              : "bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:border-[#00CDAC] dark:hover:border-[#00CDAC] hover:bg-white/90 dark:hover:bg-white/10 hover:text-[#00CDAC] dark:hover:text-[#00CDAC] shadow-xs cursor-pointer"
                          )}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/10">
                    Keine freien Slots an diesem Tag
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-xl border border-dashed border-slate-300/80 dark:border-white/10">
                  Bitte zuerst oben ein Datum anklicken
                </div>
              )}
            </div>

            {/* Summary */}
            {selectedDate && selectedTime && (
              <div className="p-3.5 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Terminwunsch:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {format(selectedDate, 'EEEE, d. MMMM yyyy')} · {selectedTime} Uhr
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Dauer & Honorar:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sessionDuration} min · {sessionPrice}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleDateTimeNext}
              disabled={!selectedDate || !selectedTime}
              className="w-full h-11 bg-[#00CDAC] hover:bg-[#02AAB0] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              Weiter zu den Kontaktdaten →
            </Button>

            {/* Direct Facilitator Claim Note */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Sind Sie {facilitatorName}?{' '}
              <Link
                href={`/auth?claim=${encodeURIComponent(facilitatorId)}&name=${encodeURIComponent(facilitatorName)}&session=${encodeURIComponent(sessionTitle)}`}
                onClick={() => onOpenChange(false)}
                className="text-[#00CDAC] font-bold hover:underline inline-flex items-center gap-1"
              >
                Jetzt einloggen & Kalender freischalten →
              </Link>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-6 space-y-6">
            {/* Event Date Banner - prominent indicator for fixed-date events */}
            {isFixedDateEvent && selectedDate && (
              <div className="bg-gradient-to-r from-highlight/10 to-highlight/5 border border-highlight/20 rounded-md p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-highlight/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-highlight" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-highlight uppercase tracking-wide">Event Date & Time</p>
                    <p className="text-base font-semibold text-foreground">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')} · {selectedTime}
                    </p>
                    {sessionDuration && (
                      <p className="text-sm text-muted-foreground">{sessionDuration} minutes</p>
                    )}
                  </div>
                  {/* Capacity indicator with scarcity styling */}
                  {remainingSpots != null && (
                    <div className={cn(
                      "flex-shrink-0 text-right",
                      isSoldOut 
                        ? "text-destructive" 
                        : remainingSpots <= 3 
                          ? "text-destructive" 
                          : remainingSpots <= 10 
                            ? "text-amber-500" 
                            : "text-highlight"
                    )}>
                      {loadingCapacity ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isSoldOut ? (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide">Sold Out</p>
                          <p className="text-sm font-semibold">No spots left</p>
                        </div>
                      ) : remainingSpots <= 3 ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide animate-pulse">Almost Full!</p>
                          <p className="text-lg font-bold">{remainingSpots} left</p>
                        </div>
                      ) : remainingSpots <= 10 ? (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide">Filling Fast</p>
                          <p className="text-lg font-bold">{remainingSpots} left</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide">Spots Left</p>
                          <p className="text-lg font-bold">{remainingSpots}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Only show back button for regular sessions (not fixed-date events) */}
              {!isFixedDateEvent && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep('datetime')}
                  className="h-8 w-8 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ihre Kontaktdaten</h2>
                {!isFixedDateEvent && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy')} · {selectedTime} Uhr
                  </p>
                )}
                {isOpsDebugEnabled() && (rateLimitRemaining !== null || retryAfterSeconds !== null || telemetryPolicy !== null) && (
                  <p className="text-xs text-gray-400">
                    Ops: remaining {rateLimitRemaining ?? "—"}
                    {retryAfterSeconds !== null ? ` · retry-after ${retryAfterSeconds}s` : ""}
                    {telemetryPolicy ? ` · ${telemetryPolicy}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Vollständiger Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleFieldChange('name', e.target.value, setName)}
                    onBlur={() => handleFieldBlur('name', name)}
                    placeholder="Vor- und Nachname"
                    className={cn(
                      "h-11 pl-10 pr-10 bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#00CDAC] focus:ring-1 focus:ring-[#00CDAC] placeholder:text-slate-400 font-medium transition-colors",
                      errors.name && touched.name && "border-red-400 focus:border-red-400",
                      isFieldValid('name', name) && "border-[#00CDAC] focus:border-[#00CDAC]"
                    )}
                  />
                  {/* Status icon */}
                  {touched.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.name ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : isFieldValid('name', name) ? (
                        <Check className="h-4 w-4 text-[#00CDAC]" />
                      ) : null}
                    </div>
                  )}
                </div>
                {errors.name && touched.name && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  E-Mail-Adresse *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                    onBlur={() => handleFieldBlur('email', email)}
                    placeholder="ihre.email@beispiel.de"
                    className={cn(
                      "h-11 pl-10 pr-10 bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#00CDAC] focus:ring-1 focus:ring-[#00CDAC] placeholder:text-slate-400 font-medium transition-colors",
                      errors.email && touched.email && "border-red-400 focus:border-red-400",
                      isFieldValid('email', email) && "border-[#00CDAC] focus:border-[#00CDAC]"
                    )}
                  />
                  {/* Status icon */}
                  {touched.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {errors.email ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : isFieldValid('email', email) ? (
                        <Check className="h-4 w-4 text-[#00CDAC]" />
                      ) : null}
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Telefonnummer (optional für WhatsApp-Bestätigung)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="h-11 pl-10 bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#00CDAC] focus:ring-1 focus:ring-[#00CDAC] placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Nachricht / Fragen an den Facilitator (optional)
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Besondere Schwerpunkte, Vorkenntnisse oder Wünsche..."
                    rows={3}
                    className="pl-10 bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#00CDAC] focus:ring-1 focus:ring-[#00CDAC] placeholder:text-slate-400 font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{sessionTitle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy')} · {selectedTime} Uhr · {sessionDuration} min
                  </p>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{sessionPrice}</p>
              </div>
            </div>

            <Button
              onClick={handleSubmitBooking}
              disabled={isSubmitting || !name || !email || isSoldOut}
              className="w-full h-11 bg-[#00CDAC] hover:bg-[#02AAB0] text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSoldOut ? 'Ausgebucht' : isSubmitting ? 'Wird übermittelt...' : (isUnclaimedOrInquiry ? 'Buchungsanfrage jetzt senden' : 'Termin anfragen')}
            </Button>

            <p className="text-xs text-center text-slate-400">
              {isSoldOut 
                ? 'Dieses Event hat die maximale Teilnehmerzahl erreicht.' 
                : isUnclaimedOrInquiry
                  ? `Wir speichern deine Anfrage. ${facilitatorName} wird nicht automatisch benachrichtigt.`
                  : 'Der Facilitator bestätigt nur, wenn der Termin auf ORIVE liegt.'}
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-7 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-[#00CDAC]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isUnclaimedOrInquiry ? 'Anfrage gespeichert' : 'Buchung angefragt'}
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Das ist keine verbindliche Buchung. {facilitatorName} wurde nicht automatisch benachrichtigt. Wir haben deine Anfrage unter {email} gespeichert.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-left space-y-2.5 text-xs">
              <p className="font-semibold text-slate-900 text-sm">{sessionTitle}</p>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy')}
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {selectedTime} Uhr ({sessionDuration} min)
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Anfrage, keine Buchung
                </span>
              </div>
            </div>

            {/* Claim notice for facilitator */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-left text-xs space-y-1">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Sind Sie {facilitatorName}?
              </p>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Schalten Sie Ihren Buchungskalender jetzt frei, um diesen Kunden direkt zu bestätigen und zukünftige Buchungen vollautomatisch zu erhalten:
              </p>
              <div className="pt-1">
                <Link
                  href={`/auth?claim=${encodeURIComponent(facilitatorId)}&name=${encodeURIComponent(facilitatorName)}&session=${encodeURIComponent(sessionTitle)}`}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Jetzt einloggen & Kalender freischalten →
                </Link>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href={`/booking/${createdBookingId || 'ORV-CONFIRM'}`}
                onClick={() => onOpenChange(false)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] hover:from-[#00CDAC]/90 hover:to-[#02AAB0]/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Buchungsdetails & Kalendereintrag (.ics) ansehen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
                className="w-full h-10 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Fertig
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
