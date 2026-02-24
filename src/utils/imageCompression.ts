/**
 * Client-side image compression using Canvas API.
 * Reduces typical 2-5MB camera captures to 100-300KB.
 */

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImage(
  input: Blob | File,
  maxWidth = 1280,
  quality = 0.8
): Promise<CompressionResult> {
  const originalSize = input.size;

  // Create an image from the blob
  const imageBitmap = await createImageBitmap(input);
  const { width: origW, height: origH } = imageBitmap;

  // Calculate new dimensions maintaining aspect ratio
  let width = origW;
  let height = origH;
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  // Draw to canvas
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  // Export as JPEG
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });

  return {
    blob,
    originalSize,
    compressedSize: blob.size,
    width,
    height,
  };
}
