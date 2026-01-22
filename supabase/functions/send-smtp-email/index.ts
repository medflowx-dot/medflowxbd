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

    // Parse settings into a map - handle JSON stringified values
    const smtpConfig: Record<string, any> = {};
    settings?.forEach((s) => {
      let value = s.setting_value;
      // Handle JSON stringified values
      if (typeof value === "string") {
        // Remove surrounding quotes if present
        value = value.replace(/^"|"$/g, "");
        // Try to parse as JSON
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if not valid JSON
        }
      }
      smtpConfig[s.setting_key] = value;
    });

    // Validate required SMTP settings
    const smtpHost = smtpConfig.smtp_host;
    const smtpUser = smtpConfig.smtp_user;
    const smtpPassword = smtpConfig.smtp_password;
    const smtpPort = Number(smtpConfig.smtp_port) || 587;
    const smtpSecure = smtpConfig.smtp_secure;
    const smtpFromEmail = smtpConfig.smtp_from_email || smtpUser;
    const smtpFromName = smtpConfig.smtp_from_name || "MedFlowX";

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error("Missing SMTP config:", { smtpHost, smtpUser, hasPassword: !!smtpPassword });
      return new Response(
        JSON.stringify({ error: "SMTP not configured. Please configure SMTP settings in Owner Admin panel." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate from email
    if (!smtpFromEmail) {
      console.error("Missing from email address");
      return new Response(
        JSON.stringify({ error: "SMTP From Email not configured. Please set smtp_from_email in settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine TLS mode based on port and settings
    // Port 465 = implicit TLS (SSL from start)
    // Port 587 = STARTTLS (upgrade after connection)
    // Port 25 = No TLS (not recommended)
    const isSecure = smtpSecure === true || smtpSecure === "true" || smtpSecure === "tls";
    const useImplicitTLS = smtpPort === 465;

    console.log("SMTP Config:", { 
      host: smtpHost, 
      port: smtpPort,
      user: smtpUser,
      secure: isSecure,
      implicitTLS: useImplicitTLS,
      fromEmail: smtpFromEmail,
      fromName: smtpFromName
    });

    // Create SMTP client with proper TLS configuration
    // For port 465: use tls: true (implicit TLS/SSL)
    // For port 587: use tls: false with STARTTLS upgrade
    const connectionConfig: any = {
      hostname: smtpHost,
      port: smtpPort,
      auth: {
        username: smtpUser,
        password: smtpPassword,
      },
    };

    // Port 465 uses implicit TLS (connection starts encrypted)
    // Port 587 uses STARTTLS (starts unencrypted, upgrades to TLS)
    if (useImplicitTLS) {
      // For port 465, we need wrapper TLS from the start
      connectionConfig.tls = true;
    } else if (isSecure) {
      // For port 587 with STARTTLS
      connectionConfig.tls = false; // Start without TLS, library will upgrade via STARTTLS
    } else {
      // No TLS
      connectionConfig.tls = false;
    }

    const client = new SMTPClient({
      connection: connectionConfig,
    });

    // Build proper RFC 5322 compliant email
    const fromAddress = smtpFromName ? `"${smtpFromName}" <${smtpFromEmail}>` : smtpFromEmail;

    console.log("Sending email with From:", fromAddress);

    await client.send({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
      replyTo: smtpFromEmail,
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
