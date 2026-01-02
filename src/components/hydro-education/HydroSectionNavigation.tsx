import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  MapPin, 
  LayoutGrid, 
  Waves, 
  Zap, 
  DollarSign, 
  Flame,
  ArrowUp,
  Home,
  Box,
  Shield,
  HardHat
} from 'lucide-react';

const sections = [
  { id: 'hero', icon: Home, label: 'Top' },
  { id: 'advantages', icon: Droplets, label: 'Advantages' },
  { id: 'containers', icon: Box, label: 'Containers' },
  { id: 'cooling-methods', icon: Thermometer, label: 'Cooling Methods' },
  { id: 'site-selection', icon: MapPin, label: 'Site Selection' },
  { id: 'layout', icon: LayoutGrid, label: 'Layout' },
  { id: 'water-systems', icon: Waves, label: 'Water Systems' },
  { id: 'electrical', icon: Zap, label: 'Electrical' },
  { id: 'network-security', icon: Shield, label: 'Network & Security' },
  { id: 'construction', icon: HardHat, label: 'Construction' },
  { id: 'economics', icon: DollarSign, label: 'Economics' },
  { id: 'waste-heat', icon: Flame, label: 'Waste Heat' },
];

const HydroSectionNavigation = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);

      // Determine active section
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      })).filter(s => s.element);

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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-foreground/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop navigation - right side */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => section.id === 'hero' ? scrollToTop() : scrollToSection(section.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-card backdrop-blur-sm text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className={`text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isActive ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100'
              }`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile navigation - bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => section.id === 'hero' ? scrollToTop() : scrollToSection(section.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px] transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-muted-foreground hover:bg-blue-500/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 right-4 lg:bottom-4 z-40 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
};

export default HydroSectionNavigation;
