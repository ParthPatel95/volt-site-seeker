
import React from 'react';

interface EnhancedLogoProps {
  className?: string;
  alt?: string;
}

export const EnhancedLogo: React.FC<EnhancedLogoProps> = ({ 
  className = "w-10 h-10 object-contain",
  alt = "VoltScout Logo"
}) => {
  return (
    <img 
      src="/lovable-uploads/bf2b6676-a2b8-43f6-9ed1-f768a22b71c0.png"
      alt={alt}
      className={className}
    />
  );
};
