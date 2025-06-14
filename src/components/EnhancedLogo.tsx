
import React, { useState, useEffect } from 'react';
import { BackgroundRemovalProcessor } from './BackgroundRemovalProcessor';

interface EnhancedLogoProps {
  className?: string;
  alt?: string;
}

export const EnhancedLogo: React.FC<EnhancedLogoProps> = ({ 
  className = "w-10 h-10 object-contain",
  alt = "VoltScout Logo"
}) => {
  const [logoSrc, setLogoSrc] = useState('/lovable-uploads/efd12727-2519-4372-a17f-7cf24282f3bf.png');
  const [showProcessor, setShowProcessor] = useState(true);

  const handleProcessingComplete = (processedImageUrl: string) => {
    setLogoSrc(processedImageUrl);
    setShowProcessor(false);
  };

  return (
    <div className="relative">
      {showProcessor && (
        <div className="absolute top-0 left-0 z-10">
          <BackgroundRemovalProcessor onProcessingComplete={handleProcessingComplete} />
        </div>
      )}
      <img 
        src={logoSrc}
        alt={alt}
        className={className}
      />
    </div>
  );
};
