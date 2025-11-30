import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { supabase } from '@/integrations/supabase/client';

const TUS_THRESHOLD = 6 * 1024 * 1024; // 6MB

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining: number;
}

interface UploadResult {
  path: string;
  fullPath: string;
}

export async function uploadFileResumable(
  file: File,
  bucketName: string,
  filePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // For small files, use standard upload
  if (file.size < TUS_THRESHOLD) {
    return uploadStandard(file, bucketName, filePath, onProgress);
  }

  // For large files, use TUS resumable upload
  return uploadWithTUS(file, bucketName, filePath, onProgress);
}

async function uploadStandard(
  file: File,
  bucketName: string,
  filePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Simulate progress callback for consistency
  if (onProgress) {
    onProgress({
      bytesUploaded: file.size,
      bytesTotal: file.size,
      percentage: 100,
      speed: 0,
      estimatedTimeRemaining: 0,
    });
  }

  return {
    path: uploadData.path,
    fullPath: uploadData.fullPath,
  };
}

async function uploadWithTUS(
  file: File,
  bucketName: string,
  filePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const projectId = 'ktgosplhknmnyagxrgbe';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE';

  let lastUpdateTime = Date.now();
  let lastBytesUploaded = 0;

  return new Promise((resolve, reject) => {
    const uppy = new Uppy({
      autoProceed: true,
      allowMultipleUploadBatches: false,
    })
      .use(Tus, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
        removeFingerprintOnSuccess: true,
        retryDelays: [0, 1000, 3000, 5000],
      })
      .on('upload-progress', (file, progress) => {
        if (!file || !onProgress) return;

        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000; // seconds
        const bytesDiff = progress.bytesUploaded - lastBytesUploaded;
        const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;

        const bytesRemaining = progress.bytesTotal - progress.bytesUploaded;
        const estimatedTimeRemaining = speed > 0 ? bytesRemaining / speed : 0;

        onProgress({
          bytesUploaded: progress.bytesUploaded,
          bytesTotal: progress.bytesTotal,
          percentage: Math.round((progress.bytesUploaded / progress.bytesTotal) * 100),
          speed,
          estimatedTimeRemaining,
        });

        lastUpdateTime = now;
        lastBytesUploaded = progress.bytesUploaded;
      })
      .on('upload-success', () => {
        resolve({
          path: filePath,
          fullPath: `${bucketName}/${filePath}`,
        });
      })
      .on('upload-error', (file, error) => {
        reject(error);
      });

    uppy.addFile({
      name: file.name,
      type: file.type,
      data: file,
      meta: {
        bucketName: bucketName,
        objectName: filePath,
        contentType: file.type,
        cacheControl: '3600',
      },
    });

    uppy.upload();
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}
