import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  url: string;
  path: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (
    file: File | Blob,
    folder?: string
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be logged in to upload images');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
      const filePath = folder 
        ? `${user.id}/${folder}/${fileName}`
        : `${user.id}/${fileName}`;

      setProgress(30);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('inventory-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(data.path);

      setProgress(100);

      return {
        url: publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const uploadFromBlob = async (
    blob: Blob,
    folder?: string
  ): Promise<UploadResult | null> => {
    return uploadImage(blob, folder);
  };

  const uploadFromDataUrl = async (
    dataUrl: string,
    folder?: string
  ): Promise<UploadResult | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return uploadImage(blob, folder);
    } catch (error) {
      console.error('Error converting data URL:', error);
      toast.error('Failed to process image');
      return null;
    }
  };

  const deleteImage = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('inventory-images')
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
      return false;
    }
  };

  return {
    uploadImage,
    uploadFromBlob,
    uploadFromDataUrl,
    deleteImage,
    isUploading,
    progress,
  };
}
