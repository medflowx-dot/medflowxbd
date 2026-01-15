import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email request data
    const { to, subject, html }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch SMTP settings from platform_settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "smtp_host",
        "smtp_port",
        "smtp_user",
        "smtp_password",
        "smtp_from_email",
        "smtp_from_name",
        "smtp_secure"
      ]);

    if (settingsError) {
      console.error("Error fetching SMTP settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch SMTP settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse settings into a map
    const smtpConfig: Record<string, any> = {};
    settings?.forEach((s) => {
      let value = s.setting_value;
      // Remove quotes from string values
      if (typeof value === "string") {
        value = value.replace(/^"|"$/g, "");
      }
      smtpConfig[s.setting_key] = value;
    });

    // Validate required SMTP settings
    if (!smtpConfig.smtp_host || !smtpConfig.smtp_user || !smtpConfig.smtp_password) {
      return new Response(
        JSON.stringify({ error: "SMTP not configured. Please configure SMTP settings in Owner Admin panel." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SMTP Config:", { 
      host: smtpConfig.smtp_host, 
      port: smtpConfig.smtp_port,
      user: smtpConfig.smtp_user,
      secure: smtpConfig.smtp_secure
    });

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.smtp_host,
        port: Number(smtpConfig.smtp_port) || 587,
        tls: smtpConfig.smtp_secure === true || smtpConfig.smtp_secure === "true",
        auth: {
          username: smtpConfig.smtp_user,
          password: smtpConfig.smtp_password,
        },
      },
    });

    // Send email
    const fromEmail = smtpConfig.smtp_from_email || smtpConfig.smtp_user;
    const fromName = smtpConfig.smtp_from_name || "MedFlowX";

    await client.send({
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
    });

    await client.close();

    console.log("Email sent successfully to:", to);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
