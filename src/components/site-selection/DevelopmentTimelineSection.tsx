import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';

const DevelopmentTimelineSection = () => {
  const phases = [
    {
      phase: "Site Selection",
      duration: "2-4 months",
      startMonth: 0,
      tasks: [
        "Market screening and site identification",
        "Initial site visits and assessment",
        "Preliminary utility discussions",
        "Due diligence and scoring"
      ],
      milestone: "Site selected, LOI signed",
      color: "bg-watt-purple"
    },
    {
      phase: "Acquisition & Planning",
      duration: "2-3 months",
      startMonth: 3,
      tasks: [
        "Execute purchase/lease agreement",
        "Submit interconnection application",
        "Engage engineering consultants",
        "Begin permit applications"
      ],
      milestone: "Land secured, interconnection filed",
      color: "bg-blue-500"
    },
    {
      phase: "Permitting & Design",
      duration: "3-6 months",
      startMonth: 5,
      tasks: [
        "Complete facility design",
        "Obtain building permits",
        "Finalize equipment procurement",
        "Utility system studies complete"
      ],
      milestone: "All permits approved",
      color: "bg-watt-bitcoin"
    },
    {
      phase: "Construction",
      duration: "4-8 months",
      startMonth: 9,
      tasks: [
        "Site preparation and grading",
        "Electrical infrastructure installation",
        "Building/container deployment",
        "Cooling system installation"
      ],
      milestone: "Construction substantially complete",
      color: "bg-watt-success"
    },
    {
      phase: "Commissioning",
      duration: "1-2 months",
      startMonth: 15,
      tasks: [
        "Utility interconnection energization",
        "Equipment testing and burn-in",
        "Mining software configuration",
        "Pool connections established"
      ],
      milestone: "First hash, operational",
      color: "bg-emerald-500"
    }
  ];

  const criticalPath = [
    { item: "Interconnection Agreement", typical: "6-18 months", critical: true },
    { item: "Transformer Lead Time", typical: "6-12 months", critical: true },
    { item: "Switchgear Lead Time", typical: "4-8 months", critical: true },
    { item: "Building Permit", typical: "2-4 months", critical: false },
    { item: "ASIC Procurement", typical: "2-6 months", critical: false },
    { item: "Container/Building Delivery", typical: "3-6 months", critical: false }
  ];

  const accelerationTips = [
    {
      tip: "Pre-approved Sites",
      description: "Sites with existing interconnection or pre-approved zoning can save 6-12 months"
    },
    {
      tip: "Turnkey Providers",
      description: "Use experienced EPC contractors who have established utility relationships"
    },
    {
      tip: "Parallel Processing",
      description: "Start equipment procurement before all permits are complete (at risk)"
    },
    {
      tip: "Modular Design",
      description: "Container-based facilities can be deployed in phases as power comes online"
    },
    {
      tip: "Off-the-Shelf",
      description: "Use standard designs rather than custom engineering to reduce timeline"
    }
  ];

  return (
    <section id="timeline" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Development Timeline
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              From Site Selection to First Hash
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              A typical greenfield development takes 12-24 months. Understanding the 
              critical path helps you plan and identify acceleration opportunities.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            objectives={[
              "Map the 5 development phases and their typical durations (12-24 months total)",
              "Identify critical path items that determine overall project timeline",
              "Apply timeline acceleration strategies to reduce time-to-hash by 6-12 months",
              "Understand long-lead equipment ordering (transformers, switchgear) timing"
            ]}
            estimatedTime="7 min"
            prerequisites={[
              { title: "Site Scoring", href: "#site-scoring" }
            ]}
          />
        </ScrollReveal>

        {/* Visual Timeline */}
        <ScrollReveal delay={100}>
          <div className="relative mb-12">
            <div className="bg-gray-50 rounded-2xl p-6">
              {/* Month markers */}
              <div className="flex justify-between mb-4 text-xs text-watt-navy/50">
                {[0, 3, 6, 9, 12, 15, 18].map(month => (
                  <span key={month}>Month {month}</span>
                ))}
              </div>
              
              {/* Timeline bars */}
              <div className="space-y-4">
                {phases.map((phase, idx) => {
                  const startPercent = (phase.startMonth / 18) * 100;
                  const durationMonths = parseInt(phase.duration.split('-')[1]) || parseInt(phase.duration);
                  const widthPercent = (durationMonths / 18) * 100;
                  
                  return (
                    <div key={idx} className="relative h-16">
                      <div 
                        className={`absolute h-full rounded-lg ${phase.color} flex items-center px-4 transition-all hover:shadow-lg`}
                        style={{ 
                          left: `${startPercent}%`, 
                          width: `${Math.min(widthPercent, 100 - startPercent)}%`,
                          minWidth: '120px'
                        }}
                      >
                        <div className="text-white">
                          <div className="font-semibold text-sm">{phase.phase}</div>
                          <div className="text-xs opacity-80">{phase.duration}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Phase Details */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {phases.map((phase, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${phase.color} flex items-center justify-center`}>
                    <span className="text-white font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-watt-navy">{phase.phase}</h4>
                    <p className="text-sm text-watt-purple">{phase.duration}</p>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {phase.tasks.map((task, i) => (
                    <li key={i} className="text-sm text-watt-navy/70 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-watt-navy/30 rounded-full mt-2 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-watt-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{phase.milestone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Critical Path & Acceleration */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Critical Path */}
          <ScrollReveal delay={300}>
            <div className="bg-watt-navy rounded-2xl p-6 text-white h-full">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-watt-bitcoin" />
                Critical Path Items
              </h3>
              <p className="text-white/70 text-sm mb-4">
                These items typically determine overall project timeline:
              </p>
              <div className="space-y-3">
                {criticalPath.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      {item.critical && (
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      )}
                      <span className="text-white/90">{item.item}</span>
                    </div>
                    <span className="text-watt-bitcoin font-medium">{item.typical}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-500/20 rounded-lg text-sm text-white/70">
                <strong className="text-red-400">⚠️ Critical:</strong> Order long-lead equipment 
                (transformers, switchgear) as early as possible, even before final permits.
              </div>
            </div>
          </ScrollReveal>

          {/* Acceleration Tips */}
          <ScrollReveal delay={400}>
            <div className="bg-gradient-to-br from-watt-success/10 to-watt-bitcoin/10 rounded-2xl p-6 h-full">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-watt-success" />
                Timeline Acceleration Strategies
              </h3>
              <div className="space-y-4">
                {accelerationTips.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-watt-navy flex items-center gap-2">
                      <span className="w-6 h-6 bg-watt-success/20 rounded-full flex items-center justify-center text-watt-success text-xs">
                        {idx + 1}
                      </span>
                      {item.tip}
                    </h4>
                    <p className="text-sm text-watt-navy/70 mt-1 ml-8">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Summary Stats */}
        <ScrollReveal delay={500}>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Typical Timeline", value: "12-24 months", sublabel: "Greenfield site" },
              { label: "Accelerated", value: "6-12 months", sublabel: "Shovel-ready site" },
              { label: "Container Deploy", value: "3-6 months", sublabel: "With existing power" },
              { label: "Critical Lead", value: "6-18 months", sublabel: "Interconnection" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-watt-purple">{stat.value}</div>
                <div className="text-sm font-medium text-watt-navy">{stat.label}</div>
                <div className="text-xs text-watt-navy/50">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={550}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "Greenfield development typically takes 12-24 months; shovel-ready sites can reduce this to 6-12 months",
              "Interconnection (6-18 months) and transformer lead time (6-12 months) are usually the critical path",
              "Order long-lead equipment (transformers, switchgear) before final permits to avoid delays",
              "Modular/container-based designs allow phased deployment as power comes online"
            ]}
            proTip="The fastest path to first hash is a brownfield site with existing interconnection and industrial zoning. These sites can deploy in 3-6 months with container-based infrastructure."
            nextSection={{
              title: "Get Started",
              id: "cta"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DevelopmentTimelineSection;
