
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AccessRequestData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platformUse: string;
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AccessRequestData = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert access request into database
    const { data, error: dbError } = await supabase
      .from('access_requests')
      .insert({
        full_name: requestData.fullName,
        email: requestData.email,
        phone: requestData.phone,
        company: requestData.company,
        role: requestData.role,
        platform_use: requestData.platformUse,
        additional_info: requestData.additionalInfo || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to submit access request');
    }

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "WattByte Access Request <onboarding@resend.dev>",
      to: ["Parth@bfarm365.com"],
      subject: "New Access Request - WattByte Platform",
      html: `
        <h1>New Access Request Submitted</h1>
        <p>A new user has requested access to the WattByte platform:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Request Details:</h2>
          <p><strong>Full Name:</strong> ${requestData.fullName}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Phone:</strong> ${requestData.phone}</p>
          <p><strong>Company:</strong> ${requestData.company}</p>
          <p><strong>Role:</strong> ${requestData.role}</p>
          <p><strong>Platform Use Case:</strong> ${requestData.platformUse}</p>
          ${requestData.additionalInfo ? `<p><strong>Additional Information:</strong> ${requestData.additionalInfo}</p>` : ''}
          <p><strong>Request ID:</strong> ${data.id}</p>
          <p><strong>Submitted:</strong> ${new Date(data.created_at).toLocaleString()}</p>
        </div>
        
        <p>Please review this request and approve or reject it through the admin panel.</p>
        <p>Best regards,<br>WattByte System</p>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "WattByte <onboarding@resend.dev>",
      to: [requestData.email],
      subject: "Access Request Received - WattByte Platform",
      html: `
        <h1>Thank you for your interest in WattByte!</h1>
        <p>Dear ${requestData.fullName},</p>
        
        <p>We have received your access request for the WattByte AI-Powered Energy Discovery Platform.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <h3>What happens next?</h3>
          <p>Our team will review your application and contact you within 24-48 hours with next steps.</p>
          <p>If approved, you'll receive login credentials and access to the VoltScout platform.</p>
        </div>
        
        <p>Request ID: ${data.id}</p>
        <p>Submitted: ${new Date(data.created_at).toLocaleString()}</p>
        
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>The WattByte Team</p>
      `,
    });

    console.log("Access request submitted and emails sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Access request submitted successfully",
      requestId: data.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in submit-access-request function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to submit access request"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
