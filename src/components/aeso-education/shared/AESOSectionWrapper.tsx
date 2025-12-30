import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'gradient' | 'accent';

interface AESOSectionWrapperProps {
  children: ReactNode;
  theme?: Theme;
  className?: string;
  id?: string;
}

const themeStyles: Record<Theme, string> = {
  light: 'bg-card',
  dark: 'bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy)/0.9)]',
  gradient: 'bg-gradient-to-b from-background to-muted/30',
  accent: 'bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.05)] to-[hsl(var(--watt-bitcoin)/0.02)]',
};

export function AESOSectionWrapper({ 
  children, 
  theme = 'light', 
  className = '',
  id 
}: AESOSectionWrapperProps) {
  return (
    <section 
      id={id}
      className={`relative py-16 md:py-24 lg:py-32 overflow-hidden ${themeStyles[theme]} ${className}`}
    >
      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
