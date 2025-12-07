import React from 'react';

console.log('🔥 PHASE 1: Testing Tailwind CSS classes only');

const Landing: React.FC = () => {
  console.log('🔥 LANDING COMPONENT RENDERING - Tailwind test');

  return (
    <div className="min-h-screen bg-watt-navy text-white flex items-center justify-center flex-col">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">WattByte Infrastructure</h1>
      <p className="text-xl text-white/80">Phase 1: Testing Tailwind CSS classes</p>
      <p className="text-base text-white/60 mt-4">If you see this styled correctly (dark blue bg, white text, centered), Tailwind works!</p>
    </div>
  );
};

export default Landing;
