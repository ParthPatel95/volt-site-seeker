/**
 * Image processing utilities for Smart Scan feature
 */

export interface ImageQualityMetrics {
  sharpness: number; // 0-100
  brightness: number; // 0-100
  isBlurry: boolean;
  isDark: boolean;
  isBright: boolean;
}

/**
 * Detect if an image is blurry using Laplacian variance method
 */
export function detectBlur(canvas: HTMLCanvasElement): { isBlurry: boolean; variance: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { isBlurry: false, variance: 100 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Convert to grayscale and calculate Laplacian
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // Apply Laplacian kernel
  const width = canvas.width;
  const height = canvas.height;
  const laplacian: number[] = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const value = 
        -gray[idx - width] +
        -gray[idx - 1] + 4 * gray[idx] - gray[idx + 1] +
        -gray[idx + width];
      laplacian.push(value);
    }
  }

  // Calculate variance
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance = laplacian.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacian.length;

  // Threshold for blur detection (lower variance = more blurry)
  const BLUR_THRESHOLD = 100;
  
  return {
    isBlurry: variance < BLUR_THRESHOLD,
    variance: Math.min(variance, 500) / 5 // Normalize to 0-100
  };
}

/**
 * Analyze image brightness
 */
export function analyzeBrightness(canvas: HTMLCanvasElement): { 
  brightness: number; 
  isDark: boolean; 
  isBright: boolean 
} {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { brightness: 50, isDark: false, isBright: false };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalBrightness = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate perceived brightness
    const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    totalBrightness += brightness;
  }
  
  const avgBrightness = totalBrightness / pixelCount;
  const normalizedBrightness = (avgBrightness / 255) * 100;
  
  return {
    brightness: normalizedBrightness,
    isDark: normalizedBrightness < 30,
    isBright: normalizedBrightness > 85
  };
}

/**
 * Get comprehensive image quality metrics
 */
export function getImageQuality(canvas: HTMLCanvasElement): ImageQualityMetrics {
  const blurResult = detectBlur(canvas);
  const brightnessResult = analyzeBrightness(canvas);
  
  return {
    sharpness: blurResult.variance,
    brightness: brightnessResult.brightness,
    isBlurry: blurResult.isBlurry,
    isDark: brightnessResult.isDark,
    isBright: brightnessResult.isBright
  };
}

/**
 * Apply auto-enhancement to image
 */
export function autoEnhanceImage(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Find min and max values for contrast stretching
  let minR = 255, maxR = 0;
  let minG = 255, maxG = 0;
  let minB = 255, maxB = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    minR = Math.min(minR, data[i]);
    maxR = Math.max(maxR, data[i]);
    minG = Math.min(minG, data[i + 1]);
    maxG = Math.max(maxG, data[i + 1]);
    minB = Math.min(minB, data[i + 2]);
    maxB = Math.max(maxB, data[i + 2]);
  }
  
  // Apply contrast stretching
  const rangeR = maxR - minR || 1;
  const rangeG = maxG - minG || 1;
  const rangeB = maxB - minB || 1;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - minR) / rangeR) * 255;
    data[i + 1] = ((data[i + 1] - minG) / rangeG) * 255;
    data[i + 2] = ((data[i + 2] - minB) / rangeB) * 255;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Compress image to reduce file size while maintaining quality
 */
export async function compressImage(
  dataUrl: string, 
  maxWidth: number = 2048,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}
