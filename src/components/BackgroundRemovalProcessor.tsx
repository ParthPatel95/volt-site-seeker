
import React, { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';

interface BackgroundRemovalProcessorProps {
  onProcessingComplete: (processedImageUrl: string) => void;
}

export const BackgroundRemovalProcessor: React.FC<BackgroundRemovalProcessorProps> = ({
  onProcessingComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        
        // Fetch the current logo
        const response = await fetch('/lovable-uploads/efd12727-2519-4372-a17f-7cf24282f3bf.png');
        const blob = await response.blob();
        
        // Load the image
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create object URL for the processed image
        const processedImageUrl = URL.createObjectURL(processedBlob);
        
        // Call the completion callback
        onProcessingComplete(processedImageUrl);
        
        toast({
          title: "Background Removed",
          description: "Logo background has been successfully removed and made transparent.",
        });
        
      } catch (error) {
        console.error('Error processing logo:', error);
        toast({
          title: "Processing Failed",
          description: "Failed to remove background from logo. Using original image.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, [onProcessingComplete, toast]);

  if (isProcessing) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>Processing logo...</span>
      </div>
    );
  }

  return null;
};
