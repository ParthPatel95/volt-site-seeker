import React from 'react';

console.log('🔥 LANDING.TSX MODULE LOADED');

const Landing: React.FC = () => {
  console.log('🔥 LANDING COMPONENT RENDERING');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A1628', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>WattByte Infrastructure</h1>
      <p style={{ fontSize: '1.25rem', opacity: 0.8 }}>Testing - If you see this, React + inline styles work!</p>
      <p style={{ fontSize: '1rem', opacity: 0.6, marginTop: '2rem' }}>The issue is likely CSS/Tailwind loading, not React.</p>
    </div>
  );
};

export default Landing;
