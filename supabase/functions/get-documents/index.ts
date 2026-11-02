import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentFilters {
  category?: string;
  visibility?: string;
  isAdminResource?: boolean;
  facilitatorId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let isAdmin = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;

      if (userId) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        isAdmin = !!roleData;
      }
    }

    // Parse query params
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const myDocuments = url.searchParams.get("my") === "true";

    let query = supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (myDocuments && userId) {
      // Get user's own documents
      query = query.eq("facilitator_id", userId);
    } else if (userId) {
      // Authenticated: show public docs + own docs
      query = query.or(`visibility.eq.public,facilitator_id.eq.${userId}`);
    } else {
      // Anonymous: only public admin resources
      query = query.eq("visibility", "public").eq("is_admin_resource", true);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: documents, error } = await query.limit(100);

    if (error) {
      console.error("Error fetching documents:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch documents" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL for each document
    const documentsWithUrls = documents?.map((doc) => ({
      ...doc,
      download_url: `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_path}`,
    })) || [];

    return new Response(
      JSON.stringify({ 
        documents: documentsWithUrls,
        isAdmin,
        userId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
