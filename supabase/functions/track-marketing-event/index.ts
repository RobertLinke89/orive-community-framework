 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };

 serve(async (req: Request) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }

   try {
     const {
       eventType,
       facilitatorId,
       profileId,
       offeringId,
       bookingId,
       utm,
       pageUrl,
       pagePath,
       referrer,
       clientToken,
     } = await req.json();

     const supabase = createClient(
       Deno.env.get("SUPABASE_URL")!,
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
     );

     // For authenticated events, grab user_id from the JWT (if present)
     const authHeader = req.headers.get("authorization");
     let userId: string | null = null;
     if (authHeader?.startsWith("Bearer ")) {
       const token = authHeader.replace("Bearer ", "");
       const {
         data: { user },
       } = await supabase.auth.getUser(token);
       userId = user?.id ?? null;
     }

     // Persist event (service role bypasses RLS)
     const { data, error } = await supabase
       .from("marketing_events")
       .insert({
         event_type: eventType,
         facilitator_id: facilitatorId ?? null,
         user_id: userId,
         profile_id: profileId ?? null,
         offering_id: offeringId ?? null,
         booking_id: bookingId ?? null,
         client_token: clientToken ?? null,
         page_url: pageUrl ?? null,
         page_path: pagePath ?? null,
         referrer: referrer ?? null,
         user_agent: req.headers.get("user-agent") ?? null,
         utm: utm ?? {},
       })
       .select("id")
       .single();

     if (error) {
       console.error("Error creating marketing event:", error);
       throw error;
     }

     console.log("Marketing event created:", data.id, "type:", eventType);
     return new Response(JSON.stringify({ success: true, eventId: data.id }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (e: unknown) {
     console.error("track-marketing-event error:", e);
     const message = e instanceof Error ? e.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: message }),
       { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });