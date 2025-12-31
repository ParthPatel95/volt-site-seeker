import React, { useState, useEffect } from 'react';
import { Zap, Wind, Cpu, Layout, ArrowUp, Globe, Gauge, Building2, Thermometer, Monitor, DollarSign, BookOpen, Clock } from 'lucide-react';

const SectionNavigation = () => {
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const sections = [
    { id: 'energy-source', icon: Globe, label: 'Energy Source', number: 1, time: '8 min' },
    { id: 'electrical', icon: Gauge, label: 'Electrical', number: 2, time: '10 min' },
    { id: 'facility-design', icon: Building2, label: 'Facility Design', number: 3, time: '7 min' },
    { id: 'airflow', icon: Thermometer, label: 'Airflow', number: 4, time: '6 min' },
    { id: 'cooling-systems', icon: Wind, label: 'Cooling', number: 5, time: '12 min' },
    { id: 'mining-hardware', icon: Cpu, label: 'Hardware', number: 6, time: '10 min' },
    { id: 'operations', icon: Monitor, label: 'Operations', number: 7, time: '8 min' },
    { id: 'economics', icon: DollarSign, label: 'Economics', number: 8, time: '9 min' },
    { id: 'facility-tour', icon: Layout, label: 'Tour', number: 9, time: '5 min' },
  ];

  const totalTime = sections.reduce((acc, s) => acc + parseInt(s.time), 0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setIsVisible(scrollTop > window.innerHeight * 0.8);

      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      // Track completed sections (scrolled past)
      const newCompleted = new Set<string>();
      let foundActive = false;

      for (let i = 0; i < sectionElements.length; i++) {
        const { id, element } = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is completed if its bottom is above the viewport center
          if (rect.bottom < window.innerHeight / 2) {
            newCompleted.add(id);
          }
          // Active section: top is above center, bottom is below center
          if (!foundActive && rect.top <= window.innerHeight / 3 && rect.bottom > window.innerHeight / 3) {
            setActiveSection(id);
            foundActive = true;
          }
        }
      }

      // Fallback for active section
      if (!foundActive) {
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
      }

      setCompletedSections(newCompleted);
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

  const completedCount = completedSections.size;
  const progressPercentage = Math.round((completedCount / sections.length) * 100);

  if (!isVisible) return null;

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-[hsl(var(--watt-bitcoin))] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Desktop sidebar navigation */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-2">
          {/* Progress indicator */}
          <div className="px-2 py-2 mb-2 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--watt-bitcoin))]" />
              <span className="text-[10px] font-medium text-foreground">{progressPercentage}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(var(--watt-bitcoin))] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-[9px]">~{totalTime} min total</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            {sections.map((section) => {
              const isCompleted = completedSections.has(section.id);
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-[hsl(var(--watt-bitcoin))] text-white'
                      : isCompleted
                        ? 'text-green-600 hover:bg-muted'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={section.label}
                >
                  {/* Section number */}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : isCompleted 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted && !isActive ? '✓' : section.number}
                  </span>
                  
                  {/* Icon and label */}
                  <div className="flex items-center gap-1.5">
                    <section.icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium whitespace-nowrap">{section.label}</span>
                  </div>
                  
                  {/* Time badge */}
                  <span className={`text-[9px] ml-auto ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {section.time}
                  </span>
                </button>
              );
            })}
            
            <div className="h-px bg-border my-1" />
            
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="text-[11px]">Back to top</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-4 left-2 right-2 z-40 lg:hidden safe-area-inset-bottom">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-1.5 overflow-x-auto scrollbar-hide touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Mobile progress indicator */}
          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-foreground">{progressPercentage}%</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--watt-bitcoin))] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground">{completedCount}/{sections.length} sections</span>
          </div>
          
          <div className="flex items-center gap-0.5 min-w-max px-1">
            {sections.map((section) => {
              const isCompleted = completedSections.has(section.id);
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex flex-col items-center p-1.5 min-w-[48px] min-h-[48px] rounded-xl transition-all touch-manipulation ${
                    isActive 
                      ? 'text-white bg-[hsl(var(--watt-bitcoin))]' 
                      : isCompleted 
                        ? 'text-green-600 bg-green-500/10' 
                        : 'text-muted-foreground'
                  }`}
                >
                  <div className="relative">
                    <section.icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                    {isCompleted && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center text-[6px] text-white font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-[8px] mt-0.5 font-medium">
                    {section.number}. {section.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            <button 
              onClick={scrollToTop} 
              className="p-1.5 min-w-[48px] min-h-[48px] flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SectionNavigation;
