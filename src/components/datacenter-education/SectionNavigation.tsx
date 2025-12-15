import React, { useState, useEffect } from 'react';
import { Zap, Wind, Cpu, Layout, ArrowUp } from 'lucide-react';

const SectionNavigation = () => {
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const sections = [
    { id: 'power-journey', icon: Zap, label: 'Power' },
    { id: 'cooling-systems', icon: Wind, label: 'Cooling' },
    { id: 'mining-hardware', icon: Cpu, label: 'Hardware' },
    { id: 'facility-tour', icon: Layout, label: 'Tour' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);

      // Show nav after scrolling past hero
      setIsVisible(scrollTop > window.innerHeight * 0.8);

      // Determine active section
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const { id, element } = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-watt-bitcoin transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Side navigation */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-card/90 backdrop-blur-sm rounded-full border border-border shadow-lg p-2">
          <div className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  activeSection === section.id
                    ? 'bg-watt-bitcoin text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={section.label}
              >
                <section.icon className="w-4 h-4" />
                
                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {section.label}
                </span>
              </button>
            ))}
            
            <div className="h-px bg-border my-1" />
            
            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <div className="bg-card/95 backdrop-blur-sm rounded-full border border-border shadow-lg p-2">
          <div className="flex items-center justify-around">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex flex-col items-center p-2 rounded-full transition-all ${
                  activeSection === section.id
                    ? 'text-watt-bitcoin'
                    : 'text-muted-foreground'
                }`}
              >
                <section.icon className={`w-5 h-5 ${
                  activeSection === section.id ? 'scale-110' : ''
                }`} />
                <span className={`text-[10px] mt-1 ${
                  activeSection === section.id ? 'font-medium' : ''
                }`}>
                  {section.label}
                </span>
              </button>
            ))}
            <button
              onClick={scrollToTop}
              className="p-2 text-muted-foreground"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SectionNavigation;
