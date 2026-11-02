-- Fix Security Vulnerabilities: Add explicit DENY policies for anonymous users

-- 1. BOOKINGS TABLE: Add explicit DENY policy for anonymous users
-- This prevents any potential RLS misconfiguration from exposing customer PII
CREATE POLICY "Deny anonymous access to bookings"
ON public.bookings
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 2. WHATSAPP_CONVERSATIONS TABLE: Add explicit DENY policy for anonymous users
-- This prevents exposure of customer phone numbers
CREATE POLICY "Deny anonymous access to whatsapp_conversations"
ON public.whatsapp_conversations
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 3. WHATSAPP_MESSAGES TABLE: Add explicit DENY policy for anonymous users
-- This prevents exposure of conversation content
CREATE POLICY "Deny anonymous access to whatsapp_messages"
ON public.whatsapp_messages
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 4. WHATSAPP_SETTINGS TABLE: Add explicit DENY policy for anonymous users
CREATE POLICY "Deny anonymous access to whatsapp_settings"
ON public.whatsapp_settings
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- 5. BOOKING_AUDIT_LOG TABLE: Add explicit DENY policy for anonymous users
CREATE POLICY "Deny anonymous access to booking_audit_log"
ON public.booking_audit_log
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);