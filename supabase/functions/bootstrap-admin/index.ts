import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate the token via getUser - extract token from header
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("JWT validation failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid user ID in token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[bootstrap-admin] Request from user: ${userId}`);

    // Check if any admin already exists
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingAdmins, error: checkError } = await serviceClient
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (checkError) {
      console.error("Failed to check existing admins:", checkError);
      return new Response(
        JSON.stringify({ error: "Database error", message: checkError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If admin exists, bootstrap is no longer allowed
    if (existingAdmins && existingAdmins.length > 0) {
      console.log("[bootstrap-admin] Admin already exists. Bootstrap blocked.");
      return new Response(
        JSON.stringify({
          error: "Bootstrap unavailable",
          message: "An admin already exists. Contact an existing admin for role assignment.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grant admin role to the first user
    const { error: insertError } = await serviceClient
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (insertError) {
      console.error("Failed to grant admin role:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to grant admin", message: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[bootstrap-admin] Admin role granted to user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin role granted successfully. You are now the first admin.",
        userId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[bootstrap-admin] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
