// Generates a downloadable PDF certificate from an academy_certificates row.
// Public endpoint: anyone with the certificate ID can download (matches the existing /verify/:id model).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let certId =
      url.searchParams.get("id") || url.searchParams.get("certificate_id");

    if (!certId && (req.method === "POST")) {
      try {
        const body = await req.json();
        certId = body?.certificate_id || body?.id || null;
      } catch {
        // ignore
      }
    }

    if (!certId || !/^[0-9a-f-]{36}$/i.test(certId)) {
      return new Response(
        JSON.stringify({ error: "Valid certificate_id required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cert, error } = await supabase
      .from("academy_certificates")
      .select("id, module_title, recipient_name, exam_score, issued_at")
      .eq("id", certId)
      .maybeSingle();

    if (error || !cert) {
      return new Response(
        JSON.stringify({ error: "Certificate not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Build PDF (landscape, A4-ish)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // landscape A4
    const { width, height } = page.getSize();

    const serif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const serifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const ink = rgb(0.05, 0.08, 0.16); // deep navy
    const gold = rgb(0.72, 0.55, 0.16);
    const muted = rgb(0.4, 0.42, 0.5);
    const subtle = rgb(0.85, 0.87, 0.92);

    // Outer border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      borderColor: gold,
      borderWidth: 2,
    });
    page.drawRectangle({
      x: 32,
      y: 32,
      width: width - 64,
      height: height - 64,
      borderColor: subtle,
      borderWidth: 0.75,
    });

    // Header brand
    const brand = "WATTBYTE ACADEMY";
    const brandWidth = sansBold.widthOfTextAtSize(brand, 12);
    page.drawText(brand, {
      x: (width - brandWidth) / 2,
      y: height - 70,
      size: 12,
      font: sansBold,
      color: gold,
    });

    // Title
    const title = "Certificate of Completion";
    const titleSize = 36;
    const titleWidth = serif.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: height - 130,
      size: titleSize,
      font: serif,
      color: ink,
    });

    // Subtitle
    const sub = "This is to certify that";
    const subSize = 13;
    const subWidth = serifItalic.widthOfTextAtSize(sub, subSize);
    page.drawText(sub, {
      x: (width - subWidth) / 2,
      y: height - 175,
      size: subSize,
      font: serifItalic,
      color: muted,
    });

    // Recipient name
    const name = cert.recipient_name || "Academy Learner";
    const nameSize = 30;
    const nameWidth = serif.widthOfTextAtSize(name, nameSize);
    page.drawText(name, {
      x: (width - nameWidth) / 2,
      y: height - 220,
      size: nameSize,
      font: serif,
      color: ink,
    });
    // Underline under name
    page.drawLine({
      start: { x: (width - Math.max(nameWidth, 280)) / 2 - 20, y: height - 230 },
      end: {
        x: (width + Math.max(nameWidth, 280)) / 2 + 20,
        y: height - 230,
      },
      thickness: 0.75,
      color: gold,
    });

    // Body
    const body1 = "has successfully completed the module";
    const body1Size = 14;
    const body1Width = sans.widthOfTextAtSize(body1, body1Size);
    page.drawText(body1, {
      x: (width - body1Width) / 2,
      y: height - 270,
      size: body1Size,
      font: sans,
      color: muted,
    });

    // Module title
    const moduleTitle = cert.module_title || "Academy Module";
    const moduleSize = 22;
    const moduleWidth = sansBold.widthOfTextAtSize(moduleTitle, moduleSize);
    page.drawText(moduleTitle, {
      x: (width - moduleWidth) / 2,
      y: height - 305,
      size: moduleSize,
      font: sansBold,
      color: ink,
    });

    // Score
    if (cert.exam_score != null) {
      const scoreText = `with a final exam score of ${cert.exam_score}%`;
      const scoreSize = 13;
      const scoreWidth = serifItalic.widthOfTextAtSize(scoreText, scoreSize);
      page.drawText(scoreText, {
        x: (width - scoreWidth) / 2,
        y: height - 335,
        size: scoreSize,
        font: serifItalic,
        color: muted,
      });
    }

    // Footer: issued date + verify
    const issued = new Date(cert.issued_at);
    const issuedStr = issued.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dateLabel = "Date Issued";
    const dateLabelSize = 9;
    page.drawText(dateLabel.toUpperCase(), {
      x: 90,
      y: 110,
      size: dateLabelSize,
      font: sansBold,
      color: muted,
    });
    page.drawText(issuedStr, {
      x: 90,
      y: 90,
      size: 13,
      font: serif,
      color: ink,
    });
    page.drawLine({
      start: { x: 90, y: 84 },
      end: { x: 290, y: 84 },
      thickness: 0.5,
      color: subtle,
    });

    const verifyLabel = "Verification";
    const verifyLabelW = sansBold.widthOfTextAtSize(
      verifyLabel.toUpperCase(),
      9,
    );
    page.drawText(verifyLabel.toUpperCase(), {
      x: width - 90 - verifyLabelW,
      y: 110,
      size: 9,
      font: sansBold,
      color: muted,
    });
    const verifyUrl = `wattbyte.com/verify/${cert.id}`;
    const verifyW = serif.widthOfTextAtSize(verifyUrl, 13);
    page.drawText(verifyUrl, {
      x: width - 90 - verifyW,
      y: 90,
      size: 13,
      font: serif,
      color: ink,
    });
    page.drawLine({
      start: { x: width - 290, y: 84 },
      end: { x: width - 90, y: 84 },
      thickness: 0.5,
      color: subtle,
    });

    // Cert ID (small)
    const idLine = `Certificate ID: ${cert.id}`;
    const idW = sans.widthOfTextAtSize(idLine, 8);
    page.drawText(idLine, {
      x: (width - idW) / 2,
      y: 50,
      size: 8,
      font: sans,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();
    const safeName = (cert.module_title || "certificate")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="wattbyte-${safeName}-${cert.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("generate-certificate-pdf error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Failed to generate PDF" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
