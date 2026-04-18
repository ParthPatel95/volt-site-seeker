import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CertificateRow {
  id: string;
  module_title: string;
  recipient_name: string;
  exam_score: number | null;
  issued_at: string;
}

/**
 * Renders a WattByte Academy certificate PDF in the browser using pdf-lib
 * and triggers a download. Layout matches a landscape A4 elegant design.
 */
export async function downloadCertificatePdf(
  certificateId: string,
  fallbackName = "wattbyte-certificate",
): Promise<void> {
  const loadingToast = toast.loading("Preparing your certificate…");
  try {
    // Lazy-load pdf-lib so it isn't part of the main bundle.
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

    const { data, error } = await supabase
      .from("academy_certificates")
      .select("id, module_title, recipient_name, exam_score, issued_at")
      .eq("id", certificateId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("Certificate not found");
    }
    const cert = data as CertificateRow;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // landscape A4
    const { width, height } = page.getSize();

    const serif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const serifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const ink = rgb(0.05, 0.08, 0.16);
    const gold = rgb(0.72, 0.55, 0.16);
    const muted = rgb(0.4, 0.42, 0.5);
    const subtle = rgb(0.85, 0.87, 0.92);

    // Borders
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

    // Brand
    const brand = "WATTBYTE ACADEMY";
    page.drawText(brand, {
      x: (width - sansBold.widthOfTextAtSize(brand, 12)) / 2,
      y: height - 70,
      size: 12,
      font: sansBold,
      color: gold,
    });

    // Title
    const title = "Certificate of Completion";
    page.drawText(title, {
      x: (width - serif.widthOfTextAtSize(title, 36)) / 2,
      y: height - 130,
      size: 36,
      font: serif,
      color: ink,
    });

    // Subtitle
    const sub = "This is to certify that";
    page.drawText(sub, {
      x: (width - serifItalic.widthOfTextAtSize(sub, 13)) / 2,
      y: height - 175,
      size: 13,
      font: serifItalic,
      color: muted,
    });

    // Recipient
    const name = cert.recipient_name || "Academy Learner";
    const nameWidth = serif.widthOfTextAtSize(name, 30);
    page.drawText(name, {
      x: (width - nameWidth) / 2,
      y: height - 220,
      size: 30,
      font: serif,
      color: ink,
    });
    const underlineW = Math.max(nameWidth, 280);
    page.drawLine({
      start: { x: (width - underlineW) / 2 - 20, y: height - 230 },
      end: { x: (width + underlineW) / 2 + 20, y: height - 230 },
      thickness: 0.75,
      color: gold,
    });

    // Body line 1
    const body1 = "has successfully completed the module";
    page.drawText(body1, {
      x: (width - sans.widthOfTextAtSize(body1, 14)) / 2,
      y: height - 270,
      size: 14,
      font: sans,
      color: muted,
    });

    // Module title
    const moduleTitle = cert.module_title || "Academy Module";
    page.drawText(moduleTitle, {
      x: (width - sansBold.widthOfTextAtSize(moduleTitle, 22)) / 2,
      y: height - 305,
      size: 22,
      font: sansBold,
      color: ink,
    });

    // Score
    if (cert.exam_score != null) {
      const scoreText = `with a final exam score of ${cert.exam_score}%`;
      page.drawText(scoreText, {
        x: (width - serifItalic.widthOfTextAtSize(scoreText, 13)) / 2,
        y: height - 335,
        size: 13,
        font: serifItalic,
        color: muted,
      });
    }

    // Footer left: date
    const issuedStr = new Date(cert.issued_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    page.drawText("DATE ISSUED", {
      x: 90,
      y: 110,
      size: 9,
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

    // Footer right: verification url
    const verifyLabel = "VERIFICATION";
    const verifyLabelW = sansBold.widthOfTextAtSize(verifyLabel, 9);
    page.drawText(verifyLabel, {
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

    // Cert ID footer
    const idLine = `Certificate ID: ${cert.id}`;
    page.drawText(idLine, {
      x: (width - sans.widthOfTextAtSize(idLine, 8)) / 2,
      y: 50,
      size: 8,
      font: sans,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${fallbackName}-${certificateId.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    toast.dismiss(loadingToast);
    toast.success("Certificate downloaded");
  } catch (err) {
    toast.dismiss(loadingToast);
    toast.error(
      err instanceof Error ? err.message : "Failed to download certificate",
    );
  }
}
