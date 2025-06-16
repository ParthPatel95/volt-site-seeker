
export const LandingBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Simplified grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Simplified gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-transparent to-neon-green/10" />
      <div className="absolute inset-0 bg-gradient-to-tl from-electric-yellow/5 via-transparent to-purple-500/5" />
      
      {/* Reduced floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-electric-yellow/5 rounded-full blur-3xl" />
    </div>
  );
};
