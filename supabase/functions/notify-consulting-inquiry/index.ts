import { Resend } from 'https://esm.sh/resend@3.2.0';

import { corsHeaders } from '../_shared/cors.ts';
import { errorResponse } from '../_shared/http.ts';
import { enforceRateLimit } from '../_shared/rateLimit.ts';

// Send an internal notification email to the advisory team when a new
// consulting inquiry is submitted. Called fire-and-forget from the Advisory
// page after the inquiry row is inserted; the user-facing flow does not block
// on this function. Requires RESEND_API_KEY in the function environment and an
// ADVISORY_RECIPIENT (defaults to advisory@wattbyte.com) override.

interface InquiryPayload {
  full_name: string;
  company: string;
  role?: string | null;
  email: string;
  phone?: string | null;
  client_type: string;
  target_capacity_mw?: number | null;
  target_geography?: string | null;
  timeline?: string | null;
  project_description?: string | null;
  source?: string | null;
}

const CLIENT_TYPE_LABEL: Record<string, string> = {
  ai_hpc: 'AI / HPC',
  bitcoin: 'Bitcoin Mining',
  inference: 'Inference / Training',
  other: 'Other',
};

function esc(s: string | null | undefined): string {
  if (s == null) return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(inq: InquiryPayload): string {
  const row = (label: string, value: string | number | null | undefined) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;">${label}</td>` +
    `<td style="padding:6px 0;color:#0f172a;font-size:14px;">${esc(value == null ? null : String(value))}</td></tr>`;
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;">
      <h2 style="color:#0A1628;margin:0 0 4px 0;">New consulting inquiry</h2>
      <p style="color:#64748b;margin:0 0 18px 0;">Submitted via the Advisory page.</p>
      <table style="border-collapse:collapse;">
        ${row('Name', inq.full_name)}
        ${row('Company', inq.company)}
        ${row('Role', inq.role ?? null)}
        ${row('Email', inq.email)}
        ${row('Phone', inq.phone ?? null)}
        ${row('Client type', CLIENT_TYPE_LABEL[inq.client_type] ?? inq.client_type)}
        ${row('Target capacity', inq.target_capacity_mw != null ? `${inq.target_capacity_mw} MW` : null)}
        ${row('Target geography', inq.target_geography ?? null)}
        ${row('Timeline', inq.timeline ?? null)}
        ${row('Source', inq.source ?? null)}
      </table>
      ${inq.project_description
        ? `<div style="margin-top:18px;padding:12px 14px;background:#f1f5f9;border-radius:8px;">
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Project description</div>
            <div style="white-space:pre-wrap;color:#0f172a;font-size:14px;">${esc(inq.project_description)}</div>
          </div>`
        : ''}
      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">Reply directly to this email to reach ${esc(inq.full_name)} (${esc(inq.email)}).</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Abuse guard: cap inquiry submissions per IP (contact form → e-mail).
  const limited = await enforceRateLimit(req, { name: 'notify-consulting-inquiry', max: 5, windowSeconds: 60, corsHeaders });
  if (limited) return limited;

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    const recipient = Deno.env.get('ADVISORY_RECIPIENT') ?? 'advisory@wattbyte.com';
    const fromAddress = Deno.env.get('ADVISORY_FROM_ADDRESS') ?? 'WattByte Advisory <advisory@wattbyte.com>';

    const inquiry = (await req.json()) as InquiryPayload;
    if (!inquiry?.email || !inquiry?.full_name) {
      throw new Error('Missing required inquiry fields');
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      reply_to: inquiry.email,
      subject: `Advisory inquiry — ${inquiry.company} (${inquiry.full_name})`,
      html: renderHtml(inquiry),
    });

    if (result.error) {
      throw new Error(`Resend rejected the message: ${result.error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: result.data?.id ?? null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('notify-consulting-inquiry failed:', error);
    return errorResponse(error, corsHeaders, { status: 500, message: 'Failed to send notification', context: 'notify-consulting-inquiry' });
  }
});
