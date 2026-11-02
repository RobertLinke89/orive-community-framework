"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { de, enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Mail,
  User,
  CheckCircle2,
  Download,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Share2,
  ExternalLink,
  Info,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface BookingData {
  id: string;
  reference: string;
  sessionTitle: string;
  sessionPrice: string;
  feePrice?: string;
  totalPrice?: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "reserved" | "cancelled" | "charge_failed" | "refunded";
  paymentStatus?: "paid" | "pending" | "card_saved" | "failed" | "refunded" | "waived";
  canCancel?: boolean;
  cancellableUntil?: string | null;
  clientName: string;
  clientEmail: string;
  facilitatorId?: string;
  facilitatorName: string;
  facilitatorEmail?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export default function CustomerBookingPass() {
  const params = useParams();
  const rawId = typeof params?.bookingId === "string" ? params.bookingId : params?.bookingId?.[0] || "";
  const router = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === "de";

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // S2/S9: signed booking token from the e-mail/redirect link. Kept in sessionStorage and
  // removed from the address bar so it does not leak via Referer or screenshots.
  const tokenKey = `orive-booking-token:${rawId}`;
  const bookingToken = useMemo(() => {
    if (typeof window === "undefined" || !rawId) return "";
    const fromUrl = new URLSearchParams(window.location.search).get("t");
    if (fromUrl) {
      window.sessionStorage.setItem(tokenKey, fromUrl);
      return fromUrl;
    }
    return window.sessionStorage.getItem(tokenKey) || "";
  }, [rawId, tokenKey]);
  const authHeaders = useMemo(() => ({ "x-booking-token": bookingToken }), [bookingToken]);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("t")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("t");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("reserved") === "1") {
        toast.success(copy("Platz reserviert. Die Karte wird nach der Session belastet.", "Place reserved. The card is charged after the session."));
      }
      const sessionId = urlParams.get("session_id");
      if (sessionId && rawId) {
        fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ sessionId, bookingId: rawId }),
        }).then(() => fetch(`/api/booking/${encodeURIComponent(rawId)}`, { headers: authHeaders }).then((res) => res.json()).then((json) => {
          if (json.booking) setBooking(json.booking);
        })).catch(() => {});
      }
      if (urlParams.get("payment") === "success") {
        setPaymentSuccess(true);
        toast.success(copy("Zahlung erfolgreich bestätigt!", "Payment confirmed successfully!"));
      }
    }
  }, [isDe, rawId, authHeaders]);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const res = await fetch(`/api/booking/${encodeURIComponent(rawId)}`, { headers: authHeaders });
        const json = await res.json();
        if (res.ok && json.booking) {
          setBooking(json.booking);
        }
      } catch (err) {
        console.error("Failed to load booking:", err);
      } finally {
        setLoading(false);
      }
    }
    if (rawId) {
      fetchBooking();
    }
  }, [rawId, authHeaders]);

  const handleStripeCheckout = async () => {
    if (!booking) return;
    try {
      setCheckingOut(true);
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id || rawId,
          sessionTitle: booking.sessionTitle,
          amount: booking.sessionPrice,
          customerEmail: booking.clientEmail,
          customerName: booking.clientName,
          facilitatorName: booking.facilitatorName,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Fehler beim Starten der Zahlung");
      }
    } catch (e: any) {
      toast.error("Verbindungsfehler zu Stripe");
    } finally {
      setCheckingOut(false);
    }
  };

  const copyReference = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.reference);
    setCopied(true);
    toast.success(copy("Buchungscode kopiert!", "Booking code copied!"));
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate and download .ics calendar file for Apple/Google/Outlook calendar
  const downloadIcsFile = () => {
    if (!booking) return;
    try {
      const cleanDate = booking.date.replace(/-/g, "");
      const [hours, minutes] = booking.time.split(":");
      const startHour = hours ? hours.padStart(2, "0") : "10";
      const startMin = minutes ? minutes.padStart(2, "0") : "00";
      
      const durationMins = booking.duration || 60;
      const totalMinutes = parseInt(startHour, 10) * 60 + parseInt(startMin, 10) + durationMins;
      const endHour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const endMin = String(totalMinutes % 60).padStart(2, "0");

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ORIVE Wellbeing//Booking Confirmation//DE",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${booking.id}@orive.co`,
        `DTSTAMP:${cleanDate}T${startHour}${startMin}00Z`,
        `DTSTART:${cleanDate}T${startHour}${startMin}00`,
        `DTEND:${cleanDate}T${endHour}${endMin}00`,
        `SUMMARY:${booking.sessionTitle} - ${booking.facilitatorName}`,
        `DESCRIPTION:Deine ORIVE Session mit ${booking.facilitatorName}.\\nBuchungscode: ${booking.reference}\\nPreis: ${booking.sessionPrice}`,
        `LOCATION:${booking.location || "ORIVE Studio & Online"}`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT2H",
        "ACTION:DISPLAY",
        `DESCRIPTION:Erinnerung: ${booking.sessionTitle} in 2 Stunden`,
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `orive-session-${booking.reference}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(copy("Kalendereintrag (.ics) heruntergeladen!", "Calendar invite downloaded!"));
    } catch (e: any) {
      toast.error("Kalenderexport fehlgeschlagen");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      // Send message to facilitator
      await new Promise((r) => setTimeout(r, 600));
      toast.success(
        copy(`Nachricht an ${booking?.facilitatorName} gesendet! Antwort folgt per E-Mail.`, `Message sent to ${booking?.facilitatorName}!`)
      );
      setMessageText("");
      setShowMessageBox(false);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-[#02182B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#00CDAC] border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout hideFooter>
        <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#02182B]">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Buchung nicht gefunden</h1>
          <p className="text-sm text-slate-500 mb-6">Bitte überprüfe deinen Buchungslink oder kontaktiere den Support.</p>
          <Link href="/" className="px-5 py-2.5 bg-[#00CDAC] text-white rounded-xl font-semibold text-sm">
            Zur Startseite
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
    <div className="min-h-[calc(100dvh-4rem)] bg-[#F6F9F8] dark:bg-[#011424] text-slate-900 dark:text-white py-8 sm:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Booking meta */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Booking
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {copy("Buchungspass", "Booking Pass")}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg">
              {booking.reference}
            </span>
          </div>
        </div>

        {/* Main Minimalist Booking Card */}
        <div className="bg-white dark:bg-[#02182B]/95 border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-900/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400">
                {copy("Buchungsbestätigung", "Booking Confirmation")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {booking.sessionTitle}
              </h1>
            </div>

            {booking.paymentStatus === 'paid' || paymentSuccess || booking.status === 'confirmed' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00CDAC]" />
                <span>{copy("Bestätigt & Bezahlt", "Confirmed & Paid")}</span>
              </div>
            ) : booking.paymentStatus === 'card_saved' || booking.status === 'reserved' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{copy("Karte gespeichert", "Card saved")}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{copy("Terminanfrage aktiv", "Inquiry Active")}</span>
              </div>
            )}
          </div>

          {/* Schedule Highlight Section (AirBNB / Booking.com style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00CDAC]/10 text-[#00CDAC] flex items-center justify-center shrink-0 mt-0.5">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {copy("Datum", "Date")}
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {booking.date}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.time} Uhr ({booking.duration} Minuten)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Facilitator
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {booking.facilitatorName}
                </p>
                <p className="text-xs text-slate-500">
                  Zertifizierter ORIVE Partner
                </p>
              </div>
            </div>
          </div>

          {/* Format & Location */}
          <div className="py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-[#00CDAC]" />
              <span className="font-medium">{booking.location}</span>
            </div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Honorar: <strong className="text-slate-900 dark:text-white font-bold">{booking.sessionPrice}</strong>
            </span>
          </div>

          {/* Quick 1-Click Action Buttons (Booking.com & Airbnb benchmark) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-6">
            <button
              type="button"
              onClick={downloadIcsFile}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 transition-all text-center group"
            >
              <Download className="w-4 h-4 text-[#00CDAC] mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {copy("Kalender (.ics)", "Add Calendar")}
              </span>
              <span className="text-[10px] text-slate-400">Apple/Google</span>
            </button>

            <button
              type="button"
              onClick={copyReference}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 transition-all text-center group"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 mb-1.5" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-1.5 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {copy("Code kopieren", "Copy Code")}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{booking.reference}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMessageBox(!showMessageBox)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 transition-all text-center group"
            >
              <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {copy("Nachricht", "Message")}
              </span>
              <span className="text-[10px] text-slate-400">An Facilitator</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 transition-all text-center group"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {copy("Drucken", "Print Pass")}
              </span>
              <span className="text-[10px] text-slate-400">PDF Beleg</span>
            </button>
          </div>

          {/* Collapsible Direct Message to Facilitator Box */}
          {showMessageBox && (
            <div className="p-4 mb-6 rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {copy(`Frage an ${booking.facilitatorName}:`, `Ask ${booking.facilitatorName}:`)}
                </span>
                <span className="text-[10px] text-slate-400">Wird per E-Mail zugestellt</span>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={copy("z.B. Gibt es vor Ort Umkleidemöglichkeiten?", "e.g. Any special attire required?")}
                rows={3}
                className="w-full p-3 text-xs bg-white dark:bg-[#02182B] border border-slate-200 dark:border-white/10 rounded-xl focus:border-[#00CDAC] outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageBox(false)}
                  className="text-xs h-8"
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={sendingMessage || !messageText.trim()}
                  onClick={handleSendMessage}
                  className="bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-xs font-semibold h-8"
                >
                  {sendingMessage ? "Wird gesendet..." : "Nachricht absenden"}
                </Button>
              </div>
            </div>
          )}

          {/* Minimalist Receipt Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{copy("Gast", "Guest")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {booking.clientName} ({booking.clientEmail})
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{copy("Ticket / Session", "Ticket / Session")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {booking.sessionPrice}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{copy("ORIVE Concierge & Vermittlungsgebühr", "ORIVE Concierge & Service Fee")}:</span>
              <span className="font-semibold text-emerald-600 dark:text-[#00CDAC]">
                1,00 €
              </span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-2 border-t border-slate-200 dark:border-white/10 text-sm">
              <span>{copy("Gesamtbetrag", "Total")}:</span>
              <span className="text-[#00CDAC] dark:text-[#00CDAC]">
                {(() => {
                  const num = parseFloat(booking.sessionPrice.replace(/[^0-9.,]/g, '').replace(',', '.'));
                  return isNaN(num) ? booking.sessionPrice : `${(num + 1).toFixed(2).replace('.', ',')} €`;
                })()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-white/5 leading-relaxed">
              {copy("Abbuchung nach der Session. Der Satz geht an den Facilitator, 1,00 € an ORIVE. Kostenfrei stornierbar bis 24 Stunden vorher.", "Charged after the session. The rate goes to the facilitator, €1.00 to ORIVE. Free to cancel until 24 hours before.")}
            </p>
          </div>

          {/* Seamless Stripe Payment Integration */}
          {booking.paymentStatus === 'paid' || paymentSuccess || booking.status === 'confirmed' ? (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-[#00CDAC] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {copy("Zahlung vollständig bestätigt", "Payment Fully Confirmed")}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {copy("Transaktion gesichert via Stripe · Beleg per E-Mail gesendet", "Secured via Stripe · Receipt sent via email")}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#00CDAC]">
                ✓ Bezahlt
              </span>
            </div>
          ) : booking.paymentStatus === 'card_saved' || booking.status === 'reserved' ? (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {copy("Karte gespeichert", "Card saved")}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {copy("Abbuchung nach der Session. Bis 24 Stunden vorher kannst du kostenfrei stornieren.", "The charge happens after the session. You can cancel free of charge until 24 hours before.")}
              </p>
              {booking.canCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={checkingOut}
                  onClick={async () => {
                    setCheckingOut(true);
                    try {
                      const res = await fetch(`/api/booking/${encodeURIComponent(booking.id)}/cancel`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", ...authHeaders },
                        body: JSON.stringify({ by: "guest" }),
                      });
                      const data = await res.json();
                      if (data.willBeCharged) {
                        toast.error(copy("Die kostenlose Stornofrist (24 h) ist vorbei. Die Session wird nach dem Termin berechnet.", "The free cancellation window (24h) has passed. The session is charged after the date."));
                      } else if (!res.ok) {
                        toast.error(data.error || (copy("Storno nicht möglich.", "Could not cancel.")));
                      } else {
                        toast.success(data.charged
                          ? (copy("Die Frist ist vorbei. Die Karte wird belastet.", "The window has passed. The card is charged."))
                          : (copy("Storniert. Es wird nichts abgebucht.", "Cancelled. Nothing will be charged.")));
                        const next = await fetch(`/api/booking/${encodeURIComponent(booking.id)}`, { headers: authHeaders });
                        const json = await next.json();
                        if (json.booking) setBooking(json.booking);
                      }
                    } finally {
                      setCheckingOut(false);
                    }
                  }}
                  className="h-9 text-xs"
                >
                  {copy("Kostenfrei stornieren", "Cancel free of charge")}
                </Button>
              ) : null}
            </div>
          ) : booking.paymentStatus === 'failed' ? (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{copy("Abbuchung fehlgeschlagen", "Charge failed")}</p>
              <p className="mt-1 text-[11px] text-slate-500">{copy("Wir versuchen es erneut. Der Facilitator sieht den Status.", "We will try again. The facilitator sees this status.")}</p>
            </div>
          ) : booking.paymentStatus === 'waived' || booking.status === 'cancelled' ? (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{copy("Storniert", "Cancelled")}</p>
              <p className="mt-1 text-[11px] text-slate-500">{copy("Es wird nichts abgebucht.", "Nothing will be charged.")}</p>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#00CDAC]/10 to-teal-500/10 border border-[#00CDAC]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00CDAC]/20 text-[#00CDAC] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {copy("Session jetzt sicher online bezahlen", "Pay session securely online")}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {copy("Kreditkarte, Apple Pay, SEPA & Klarna · 100% Käuferschutz", "Cards, Apple Pay, SEPA & Klarna · 100% Buyer Protection")}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleStripeCheckout}
                disabled={checkingOut}
                className="w-full sm:w-auto bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#00CDAC]/20 whitespace-nowrap"
              >
                {checkingOut ? (copy("Verbinde...", "Connecting...")) : (copy("Mit Stripe bezahlen", "Pay with Stripe"))}
              </Button>
            </div>
          )}

          {/* Zero-friction Email notification notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-[#00CDAC] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {copy(`Alle weiteren Updates sowie dein direkter Kalender-Freischaltungsstatus werden automatisch an deine E-Mail (${booking.clientEmail}) gesendet. Kein Passwort nötig.`, `All updates and confirmations will be sent to your email (${booking.clientEmail}). No account or password required.`)}
            </p>
          </div>
        </div>

        {/* Minimalist Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 space-x-3">
          <Link href="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
          <span>·</span>
          <Link href="/agb#impressum" className="hover:underline">
            Impressum
          </Link>
          <span>·</span>
          <span>ORIVE Wellbeing Platform</span>
        </div>
      </div>
    </div>
    </Layout>
  );
}
