import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  label: string;
  icon?: string;
}

const sections: Section[] = [
  { id: 'hero', label: 'Overview', icon: '🏠' },
  { id: 'thesis', label: 'Thesis', icon: '💡' },
  { id: 'fund-overview', label: 'Fund I', icon: '📊' },
  { id: 'growth-plan', label: 'Growth', icon: '📈' },
  { id: 'why-invest', label: 'Why Invest', icon: '✨' },
  { id: 'market', label: 'Market', icon: '🌍' },
  { id: 'process', label: 'Process', icon: '🚀' },
  { id: 'cta', label: 'Invest', icon: '💰' },
];

export const StickyProgressNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show nav after scrolling past hero
      setIsVisible(scrollPosition > windowHeight * 0.5);
      
      // Calculate overall progress
      const totalProgress = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(totalProgress, 100));

      // Determine active section
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.5 && rect.bottom >= windowHeight * 0.3) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-1"
        >
          {/* Progress bar */}
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-watt-trust via-watt-bitcoin to-watt-success rounded-full"
              style={{ height: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            
            return (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'hover:bg-white/10'
                }`}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Label - shows on hover or active */}
                <motion.span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                  }`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                >
                  {section.label}
                </motion.span>

                {/* Dot indicator */}
                <div className="relative">
                  <motion.div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      isActive 
                        ? 'bg-watt-bitcoin' 
                        : 'bg-white/30 group-hover:bg-white/50'
                    }`}
                    animate={{
                      scale: isActive ? [1, 1.3, 1] : 1,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-watt-bitcoin"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default StickyProgressNav;
