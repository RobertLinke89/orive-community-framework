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
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password generator function
function generatePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SignupRequest = await req.json();

    // Validate email input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedEmail.length < 5 || trimmedEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Email must be between 5 and 255 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing user account creation request");

    // Create Supabase admin client
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

    // Rate limiting check - max 3 signup attempts per hour per email
    const { data: rateLimit } = await supabaseAdmin
      .from('rate_limits')
      .select('attempt_count, window_start')
      .eq('identifier', trimmedEmail)
      .eq('action', 'signup_credentials')
      .gte('window_start', new Date(Date.now() - 3600000).toISOString())
      .maybeSingle();

    if (rateLimit && rateLimit.attempt_count >= 3) {
      console.log('Rate limit exceeded for:', trimmedEmail);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit counter
    await supabaseAdmin.from('rate_limits').upsert({
      identifier: trimmedEmail,
      action: 'signup_credentials',
      attempt_count: (rateLimit?.attempt_count || 0) + 1,
      window_start: rateLimit?.window_start || new Date().toISOString()
    });

    // Generate random password
    const password = generatePassword();

    // Create user account
    const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User created successfully, sending email...");

    // Get the deployed URL
    const deployedUrl = "https://orive.app";
    const storageUrl = Deno.env.get("SUPABASE_URL") + "/storage/v1/object/public/email-assets";
    
    // Extract name from email for personalization
    const emailName = trimmedEmail.split('@')[0];
    const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ');
    
    // Send email with credentials
    const emailResponse = await resend.emails.send({
      from: "ORIVE <onboarding@resend.dev>",
      to: [trimmedEmail],
      subject: "Welcome to ORIVE - Your Account Credentials",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; background-color: #0a1628;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a1628; padding: 0;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0f2137;">
                  
                  <!-- Header with Network Background -->
                  <tr>
                    <td style="background: linear-gradient(180deg, #0a1628 0%, #0f2137 100%); padding: 40px 40px 30px; text-align: center;">
                      <!-- ORIVE Logo -->
                      <div style="color: #e0e0e0; font-size: 32px; font-weight: 300; letter-spacing: 8px; margin-bottom: 20px;">ORIVE</div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 30px 40px; color: #ffffff;">
                      <!-- Welcome Message -->
                      <h1 style="font-size: 28px; font-weight: 400; margin: 0 0 15px 0; color: #ffffff; font-style: italic;">
                        Hi ${displayName}, welcome!
                      </h1>
                      
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.9);">
                        Your ORIVE account has been created,
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a3a5c; border-radius: 8px; margin: 0 0 25px 0;">
                        <tr>
                          <td style="padding: 20px 25px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom: 12px;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">Account:</td>
                                      <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right;">${trimmedEmail}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">Password:</td>
                                      <td style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: right;">${password}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                        <tr>
                          <td>
                            <a href="${deployedUrl}/auth" style="display: block; background-color: #FFB800; color: #0a1628; text-decoration: none; padding: 18px 20px; text-align: center; font-weight: 600; font-size: 16px; border-radius: 0;">
                              Authenticate
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Divider -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px 0;">
                        <tr>
                          <td style="border-top: 1px dashed rgba(255, 255, 255, 0.3);"></td>
                        </tr>
                      </table>

                      <!-- Footer Signature -->
                      <p style="font-size: 14px; margin: 0 0 5px 0; color: rgba(255, 255, 255, 0.8); font-style: italic;">
                        Aho,
                      </p>
                      <p style="font-size: 14px; margin: 0 0 20px 0; color: rgba(255, 255, 255, 0.8);">
                        Your ORIVE Core Team.
                      </p>
                      
                      <!-- Social Icons -->
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right: 12px;">
                            <a href="#" style="display: inline-block; width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 30px; color: rgba(255, 255, 255, 0.6); text-decoration: none; font-size: 14px;">f</a>
                          </td>
                          <td style="padding-right: 12px;">
                            <a href="#" style="display: inline-block; width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 30px; color: rgba(255, 255, 255, 0.6); text-decoration: none; font-size: 14px;">𝕏</a>
                          </td>
                          <td>
                            <a href="#" style="display: inline-block; width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%; text-align: center; line-height: 30px; color: rgba(255, 255, 255, 0.6); text-decoration: none; font-size: 14px;">in</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Security Note -->
                  <tr>
                    <td style="padding: 20px 40px 40px;">
                      <p style="font-size: 12px; margin: 0; color: rgba(255, 255, 255, 0.4); line-height: 1.5;">
                        For security, please change your password after your first login. If you didn't request this account, you can safely ignore this email.
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

    console.log("User creation and email notification completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created! Check your email for login credentials." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-login-credentials function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
