import { FileSearch, Users, Map, ClipboardCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const eiaSteps = [
  { step: 1, title: 'Scoping', description: 'Define study area and identify sensitive receptors', icon: Map },
  { step: 2, title: 'Baseline Survey', description: 'Measure existing ambient noise levels over 24-48 hours', icon: FileSearch },
  { step: 3, title: 'Source Modeling', description: 'Calculate predicted noise from proposed equipment', icon: ClipboardCheck },
  { step: 4, title: 'Impact Assessment', description: 'Compare predicted levels against standards and baseline', icon: AlertCircle },
  { step: 5, title: 'Mitigation Planning', description: 'Design control measures for any exceedances', icon: CheckCircle },
  { step: 6, title: 'Stakeholder Engagement', description: 'Consult with affected community members', icon: Users },
];

export const EnvironmentalImpactSection = () => {
  return (
    <section id="environmental" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <LearningObjectives
            objectives={[
              'Understand the 6-step Noise Impact Assessment process',
              'Know Alberta regulatory submission requirements',
              'Prepare effective stakeholder engagement strategies',
              'Navigate the AUC approval workflow'
            ]}
            estimatedTime="5 min"
            prerequisites={[
              { title: 'Monitoring', href: '#monitoring' }
            ]}
          />

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-success/10 rounded-full mb-4">
              <FileSearch className="h-4 w-4 text-watt-success" />
              <span className="text-sm font-medium text-watt-success">Environmental Assessment</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Environmental Impact Assessment
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              A noise impact assessment (NIA) is typically required for new mining facilities. 
              Understanding the process helps ensure smooth regulatory approval.
            </p>
          </div>
        </ScrollReveal>

        {/* EIA Process Steps */}
        <ScrollReveal delay={100}>
          <Card className="bg-white border-none shadow-institutional mb-12">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6">Noise Impact Assessment Process</h3>
              
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-watt-success/20 hidden md:block" />
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eiaSteps.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="relative">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-watt-success/10 flex items-center justify-center flex-shrink-0 border-2 border-watt-success/20">
                            <Icon className="h-5 w-5 text-watt-success" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-watt-success bg-watt-success/10 px-2 py-0.5 rounded">
                                Step {item.step}
                              </span>
                            </div>
                            <h4 className="font-semibold text-watt-navy">{item.title}</h4>
                            <p className="text-sm text-watt-navy/60 mt-1">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Alberta Regulatory Workflow */}
        <ScrollReveal delay={200}>
          <Card className="bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white border-none shadow-xl">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Alberta Regulatory Submission Workflow</h3>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="font-semibold">Pre-Application</p>
                  <p className="text-xs text-white/60 mt-1">Consultation with AUC and stakeholders</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-semibold">NIA Report</p>
                  <p className="text-xs text-white/60 mt-1">Submit noise study per Rule 012</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="font-semibold">AUC Review</p>
                  <p className="text-xs text-white/60 mt-1">Technical review and IR process</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="font-semibold">Approval</p>
                  <p className="text-xs text-white/60 mt-1">Permit with conditions</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-success/20 rounded-lg">
                <p className="text-sm">
                  <strong>Alberta Heartland Advantage:</strong> Our 1.7km setback and hydro-cooling technology
                  means noise levels are far below thresholds, simplifying the approval process and reducing
                  stakeholder concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <SectionSummary
            title="Environmental Assessment"
            takeaways={[
              'NIA follows a structured 6-step process from scoping to engagement',
              'Baseline surveys establish pre-existing noise conditions',
              'Alberta AUC Rule 012 governs noise submissions',
              'Well-designed facilities simplify the approval process'
            ]}
            nextSteps={[{ title: 'Case Study: Alberta Heartland', href: '#case-study' }]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
