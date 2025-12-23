import { useState } from 'react';
import { MapPin, Search, FileText, Handshake, Hammer, CheckCircle2, ArrowRight } from 'lucide-react';

const SiteSelectionWorkflowDiagram = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Identify',
      subtitle: 'Market Screening',
      icon: Search,
      duration: '2-4 weeks',
      description: 'Screen global markets for optimal energy costs, regulatory environment, and climate conditions.',
      tasks: [
        'Research deregulated vs regulated markets',
        'Compare energy rates by region',
        'Identify crypto-friendly jurisdictions',
        'Create long list of potential regions'
      ],
      sectionLink: '#intro'
    },
    {
      id: 2,
      title: 'Analyze',
      subtitle: 'Technical Feasibility',
      icon: FileText,
      duration: '4-6 weeks',
      description: 'Deep-dive into power infrastructure, interconnection requirements, and site-specific factors.',
      tasks: [
        'Evaluate substation capacity',
        'Estimate interconnection costs',
        'Assess climate and PUE impact',
        'Review zoning and permits'
      ],
      sectionLink: '#power-infrastructure'
    },
    {
      id: 3,
      title: 'Negotiate',
      subtitle: 'Deal Structuring',
      icon: Handshake,
      duration: '2-4 weeks',
      description: 'Negotiate power agreements, land terms, and secure favorable conditions.',
      tasks: [
        'Request utility LOI',
        'Negotiate PPA or rate terms',
        'Structure land purchase/lease',
        'Identify tax incentives'
      ],
      sectionLink: '#energy-markets'
    },
    {
      id: 4,
      title: 'Acquire',
      subtitle: 'Due Diligence & Close',
      icon: MapPin,
      duration: '6-8 weeks',
      description: 'Complete comprehensive due diligence and execute acquisition agreements.',
      tasks: [
        'Environmental Phase I',
        'Title and legal review',
        'Final interconnection agreement',
        'Execute purchase/lease'
      ],
      sectionLink: '#due-diligence'
    },
    {
      id: 5,
      title: 'Develop',
      subtitle: 'Construction & Energize',
      icon: Hammer,
      duration: '6-18 months',
      description: 'Obtain permits, complete construction, and energize facility.',
      tasks: [
        'Building permits',
        'Infrastructure construction',
        'Equipment installation',
        'Utility energization'
      ],
      sectionLink: '#timeline'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 text-center">
        Site Acquisition Workflow
      </h3>

      {/* Desktop Timeline */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-gradient-to-r from-watt-purple via-watt-bitcoin to-watt-success rounded-full" />
          
          {steps.map((step, idx) => (
            <div 
              key={step.id}
              className="flex flex-col items-center relative z-10 w-1/5 cursor-pointer group"
              onMouseEnter={() => setActiveStep(step.id)}
              onMouseLeave={() => setActiveStep(null)}
              onClick={() => {
                const element = document.querySelector(step.sectionLink);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                activeStep === step.id 
                  ? 'bg-watt-purple scale-110 shadow-lg shadow-watt-purple/30' 
                  : 'bg-white/20 group-hover:bg-watt-purple/50'
              }`}>
                <step.icon className={`w-7 h-7 ${
                  activeStep === step.id ? 'text-white' : 'text-white/80'
                }`} />
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-white font-bold">{step.title}</div>
                <div className="text-white/60 text-sm">{step.subtitle}</div>
                <div className="text-watt-bitcoin text-xs mt-1">{step.duration}</div>
              </div>

              {/* Tooltip */}
              {activeStep === step.id && (
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 p-4 bg-watt-navy border border-white/20 rounded-xl shadow-xl z-20">
                  <p className="text-white/80 text-sm mb-3">{step.description}</p>
                  <ul className="space-y-1">
                    {step.tasks.map((task, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-watt-success" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center gap-1 text-xs text-watt-purple">
                    Click to jump to section <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, idx) => (
          <a
            key={step.id}
            href={step.sectionLink}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-watt-purple/30 flex items-center justify-center flex-shrink-0">
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{step.title}</span>
                <span className="text-watt-bitcoin text-xs">{step.duration}</span>
              </div>
              <p className="text-white/60 text-sm">{step.subtitle}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40" />
          </a>
        ))}
      </div>

      {/* Total Timeline */}
      <div className="mt-8 text-center p-4 bg-watt-success/20 rounded-xl">
        <div className="text-white/70 text-sm">Typical Total Timeline</div>
        <div className="text-2xl font-bold text-watt-success">12-24 Months</div>
        <div className="text-white/50 text-xs mt-1">From initial screening to first hash</div>
      </div>
    </div>
  );
};

export default SiteSelectionWorkflowDiagram;
