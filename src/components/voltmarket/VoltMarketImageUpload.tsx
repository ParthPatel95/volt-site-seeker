
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface VoltMarketImageUploadProps {
  listingId?: string;
  existingImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucket: 'listing-images' | 'profile-images' | 'documents';
}

export const VoltMarketImageUpload: React.FC<VoltMarketImageUploadProps> = ({
  listingId,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
  bucket
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useVoltMarketAuth();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Check if user is available from auth context
      if (!user) {
        console.error('No user available for upload');
        toast({
          title: "Authentication Error",
          description: "Please sign in to upload images",
          variant: "destructive"
        });
        return null;
      }

      // Use user ID as folder when no listing ID is available
      const filePath = listingId ? `${listingId}/${fileName}` : `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      const newImages = [...images, ...validUrls];
      setImages(newImages);
      onImagesChange(newImages);

      toast({
        title: "Images uploaded",
        description: `${validUrls.length} image(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract file path from URL - get the last two parts (folder/filename)
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      
      // Reconstruct the full path used during upload
      const filePath = `${folderName}/${fileName}`;

      await supabase.storage
        .from(bucket)
        .remove([filePath]);

      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);

      toast({
        title: "Image removed",
        description: "Image deleted successfully"
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Images ({images.length}/{maxImages})</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No images uploaded yet</p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Click to upload images
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(image, index)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
