
export const LandingBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Clean gradient background - Apple style */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted to-background" />
      
      {/* Subtle geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Very subtle accent gradients for depth */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-secondary/3 to-transparent" />
    </div>
  );
};
