import React, { useState, useEffect } from 'react';
import { ArrowUp, BookOpen, Clock, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavSection {
  id: string;
  icon: LucideIcon;
  label: string;
  time?: string;
}

interface EducationSectionNavProps {
  sections: NavSection[];
  accentColor?: string; // tailwind color class like 'watt-bitcoin', 'blue-500', etc.
}

const EducationSectionNav: React.FC<EducationSectionNavProps> = ({ 
  sections,
  accentColor = 'watt-bitcoin'
}) => {
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('education-nav-collapsed');
      return stored === 'true';
    }
    return false;
  });

  const totalTime = sections.reduce((acc, s) => acc + parseInt(s.time || '0'), 0);

  useEffect(() => {
    localStorage.setItem('education-nav-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setIsVisible(scrollTop > window.innerHeight * 0.5);

      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      const newCompleted = new Set<string>();
      let foundActive = false;

      for (let i = 0; i < sectionElements.length; i++) {
        const { id, element } = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.bottom < window.innerHeight / 2) {
            newCompleted.add(id);
          }
          if (!foundActive && rect.top <= window.innerHeight / 3 && rect.bottom > window.innerHeight / 3) {
            setActiveSection(id);
            foundActive = true;
          }
        }
      }

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
  }, [sections]);

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

  // Dynamic color classes
  const accentBg = `bg-${accentColor}`;
  const accentText = `text-${accentColor}`;

  return (
    <>
      {/* Progress bar at top - always visible after scrolling */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-40">
          <div 
            className={`h-full ${accentBg} transition-all duration-150`} 
            style={{ width: `${scrollProgress}%` }} 
          />
        </div>
      )}

      {/* Toggle button - visible on desktop when scrolled */}
      {isVisible && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`fixed top-20 z-40 hidden lg:flex items-center justify-center w-10 h-10 rounded-full ${accentBg} text-white shadow-lg hover:opacity-90 transition-all ${
            isCollapsed ? 'right-4' : 'right-[232px]'
          }`}
          title={isCollapsed ? 'Show navigation' : 'Hide navigation'}
        >
          {isCollapsed ? (
            <PanelRightOpen className="w-5 h-5" />
          ) : (
            <PanelRightClose className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Desktop sidebar navigation - hidden on mobile, toggleable on desktop */}
      {isVisible && !isCollapsed && (
        <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block animate-in slide-in-from-right duration-300">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-2">
            {/* Progress indicator */}
            <div className="px-2 py-2 mb-2 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className={`w-3.5 h-3.5 ${accentText}`} />
                <span className="text-[10px] font-medium text-foreground">{progressPercentage}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${accentBg} transition-all duration-300 rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {totalTime > 0 && (
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px]">~{totalTime} min total</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {sections.map((section, index) => {
                const isCompleted = completedSections.has(section.id);
                const isActive = activeSection === section.id;
                const SectionIcon = section.icon;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                      isActive
                        ? `${accentBg} text-white`
                        : isCompleted
                          ? 'text-green-600 hover:bg-muted'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={section.label}
                  >
                    {/* Section number */}
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isCompleted 
                          ? 'bg-green-500/20 text-green-600' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted && !isActive ? '✓' : index + 1}
                    </span>
                    
                    {/* Icon and label */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SectionIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px] font-medium truncate max-w-[100px]">{section.label}</span>
                    </div>
                    
                    {/* Time badge */}
                    {section.time && (
                      <span className={`text-[9px] ml-auto shrink-0 ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {section.time}
                      </span>
                    )}
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
      )}
    </>
  );
};

export default EducationSectionNav;
