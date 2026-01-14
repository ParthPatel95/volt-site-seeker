import facilityImage from '@/assets/alberta-facility-aerial.jpg';
import './landing-animations.css';

export const FacilityShowcase = () => {
  return (
    <div className="relative w-full h-full">
      {/* Base Photo Layer with Slower Cinematic Ken Burns Effect */}
      <div className="absolute inset-0 animate-ken-burns-ultra-slow">
        <img 
          src={facilityImage} 
          alt="Alberta Heartland 135 Facility - Strategic Power Infrastructure"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          style={{
            filter: 'saturate(0.92) brightness(1.02) contrast(1.05)',
          }}
        />
        
        {/* Subtle Animated Ambient Light Overlay */}
        <div className="absolute inset-0 animate-ambient-light opacity-0" 
          style={{
            background: 'linear-gradient(135deg, rgba(0, 82, 255, 0.04) 0%, rgba(247, 147, 26, 0.04) 50%, rgba(0, 211, 149, 0.04) 100%)',
          }}
        />
        
        {/* Premium Vignette Effect */}
        <div 
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.12)',
          }}
        />
      </div>
      
      {/* Optional: Ultra-Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-float-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.15,
              animationDelay: `${i * 4}s`,
              animationDuration: `${30 + i * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
