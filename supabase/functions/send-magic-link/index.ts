import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupRequest {
  email: string;
  captchaToken?: string;
  redirectTo?: string;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteip) form.set("remoteip", remoteip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!resp.ok) return false;
  const json = await resp.json();
  return !!json.success;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, captchaToken, redirectTo } = body as SignupRequest;

    // Input validation
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length < 5 || trimmedEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing magic link request");

    // Require CAPTCHA token
    if (!captchaToken || typeof captchaToken !== "string" || captchaToken.length < 10) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || undefined;
    const captchaOk = await verifyTurnstile(captchaToken, ip);
    if (!captchaOk) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Rate limiting check - max 3 magic link requests per hour per email
    const { data: rateLimit } = await supabaseAdmin
      .from('rate_limits')
      .select('attempt_count, window_start')
      .eq('identifier', trimmedEmail)
      .eq('action', 'magic_link_send')
      .gte('window_start', new Date(Date.now() - 3600000).toISOString())
      .maybeSingle();

    if (rateLimit && rateLimit.attempt_count >= 3) {
      console.log('Rate limit exceeded for:', trimmedEmail);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in an hour.' }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update rate limit counter
    await supabaseAdmin.from('rate_limits').upsert({
      identifier: trimmedEmail,
      action: 'magic_link_send',
      attempt_count: (rateLimit?.attempt_count || 0) + 1,
      window_start: rateLimit?.window_start || new Date().toISOString()
    });

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === trimmedEmail);

    if (!userExists) {
      // Create new user with email confirmation
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        email_confirm: true,
      });

      if (createError) {
        console.error("User creation error:", createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("New user created successfully");
    }

    // Generate magic link
    // Prefer explicit redirect passed from the client so it works across preview/custom domains.
    const redirectUrl =
      typeof redirectTo === "string" && /^https?:\/\//i.test(redirectTo)
        ? redirectTo
        : "https://orive.app/app";
    
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: trimmedEmail,
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (magicLinkError || !magicLinkData) {
      console.error("Magic link generation error:", magicLinkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate magic link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Magic link generated successfully");

    // Send email with magic link
    const emailResponse = await resend.emails.send({
      from: "Orive <onboarding@resend.dev>",
      to: [trimmedEmail],
      subject: "Your Secure Sign-In Link for Orive",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a4d68; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a4d68 0%, #1a5f7a 100%); border-radius: 0; max-width: 600px;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #0a4d68 0%, #1a5f7a 100%);">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 10px;">
                            <div style="color: #00CDAC; font-size: 32px; font-weight: 300; letter-spacing: 2px; margin: 0;">🦋 ORIVE</div>
                            <div style="color: #00CDAC; font-size: 16px; margin-top: 5px; font-weight: 300;">Your Journey Matters.</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main content -->
                  <tr>
                    <td style="padding: 30px 40px; color: white;">
                      <h2 style="font-size: 28px; font-weight: 400; margin: 0 0 20px 0; color: white;">
                        ${userExists ? "Welcome Back!" : "Welcome to Orive!"}
                      </h2>
                      
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: rgba(255, 255, 255, 0.9);">
                        ${userExists 
                          ? "Click the button below to securely sign in to your account." 
                          : "Your account has been created! Click the button below to securely sign in for the first time."}
                      </p>

                      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.7);">
                        This secure link will expire in 1 hour and can only be used once.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${magicLinkData.properties.action_link}" style="display: inline-block; background: linear-gradient(to right, #FFA500, #FF8C00); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);">
                              Sign In Securely
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 20px 0; color: rgba(255, 255, 255, 0.6);">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="font-size: 12px; line-height: 1.4; margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.5); word-break: break-all; background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px;">
                        ${magicLinkData.properties.action_link}
                      </p>

                      <p style="font-size: 14px; line-height: 1.6; margin: 0; color: rgba(255, 255, 255, 0.7);">
                        If you have any questions or need assistance, feel free to reach out to our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="font-size: 14px; margin: 0 0 15px 0; color: rgba(255, 255, 255, 0.8);">
                        Namaste,<br>
                        <strong>Your ORIVE Team</strong>
                      </p>
                      
                      <!-- Social Icons -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right: 15px;">
                            <a href="#" style="display: inline-block; width: 36px; height: 36px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 32px; color: #00CDAC; text-decoration: none; font-size: 18px;">f</a>
                          </td>
                          <td style="padding-right: 15px;">
                            <a href="#" style="display: inline-block; width: 36px; height: 36px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 32px; color: #00CDAC; text-decoration: none; font-size: 18px;">𝕏</a>
                          </td>
                          <td>
                            <a href="#" style="display: inline-block; width: 36px; height: 36px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 32px; color: #00CDAC; text-decoration: none; font-size: 18px;">in</a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 12px; margin: 20px 0 0 0; color: rgba(255, 255, 255, 0.5); line-height: 1.4;">
                        If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Magic link email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Magic link sent! Check your email to sign in." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-magic-link function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
