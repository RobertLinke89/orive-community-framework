import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEventRequest {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // in minutes
  facilitatorName: string;
  location?: string;
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@orive.app`;
}

function formatICSDate(date: string, time: string): string {
  // Convert YYYY-MM-DD and HH:MM to YYYYMMDDTHHMMSS format
  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

function addMinutesToTime(date: string, time: string, minutes: number): string {
  const dateObj = new Date(`${date}T${time}:00`);
  dateObj.setMinutes(dateObj.getMinutes() + minutes);
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hour = String(dateObj.getHours()).padStart(2, '0');
  const minute = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}T${hour}${minute}00`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function generateICSContent(event: CalendarEventRequest): string {
  const uid = generateUID();
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  
  const dtstart = formatICSDate(event.date, event.time);
  const dtend = addMinutesToTime(event.date, event.time, event.duration);
  
  const summary = escapeICSText(`${event.title} with ${event.facilitatorName}`);
  const description = escapeICSText(
    event.description || 
    `Your session with ${event.facilitatorName}.\n\nBooked via ORIVE - The Wellness Platform`
  );
  const location = event.location ? escapeICSText(event.location) : '';

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ORIVE//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
  ];

  if (location) {
    icsLines.push(`LOCATION:${location}`);
  }

  icsLines.push(
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsLines.join('\r\n');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Support both GET (with query params) and POST (with body)
    let eventData: CalendarEventRequest;
    
    if (req.method === 'GET') {
      // Parse from query parameters
      eventData = {
        title: url.searchParams.get('title') || 'Session',
        description: url.searchParams.get('description') || undefined,
        date: url.searchParams.get('date') || '',
        time: url.searchParams.get('time') || '',
        duration: parseInt(url.searchParams.get('duration') || '60', 10),
        facilitatorName: url.searchParams.get('facilitator') || 'Facilitator',
        location: url.searchParams.get('location') || undefined,
      };
    } else {
      eventData = await req.json();
    }

    // Validate required fields
    if (!eventData.date || !eventData.time) {
      console.error('Missing required fields:', { date: eventData.date, time: eventData.time });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: date and time' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating calendar event:', eventData);

    const icsContent = generateICSContent(eventData);
    const filename = `orive-session-${eventData.date}.ics`;

    console.log('Calendar event generated successfully');

    return new Response(icsContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating calendar event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});