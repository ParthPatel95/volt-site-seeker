
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImageGeneratorProps {
  prompt: string;
  className?: string;
  alt: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ prompt, className, alt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateImage = async () => {
    if (hasGenerated) return; // Only generate once
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.image);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to placeholder
      setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop`);
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    generateImage();
  }, []);

  if (isLoading) {
    return (
      <div className={`${className} bg-slate-800/50 rounded-lg flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`${className} bg-slate-800/50 rounded-lg flex items-center justify-center`}>
        <span className="text-slate-400">Image unavailable</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
