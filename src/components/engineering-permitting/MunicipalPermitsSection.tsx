import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, FileText, Clock, CheckCircle2, AlertTriangle, Building, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight, EPStepByStep, EPCallout } from './shared';

const MunicipalPermitsSection = () => {
  const permitSteps = [
    {
      title: "Pre-Application Consultation",
      description: "Contact Lamont County Planning & Development at 780-895-2233 to discuss your project. Staff can advise on zoning compatibility and application requirements before formal submission."
    },
    {
      title: "Application Submission",
      description: "Complete the Development Permit Application form with required documents: site plan, building plans, legal land description, and project description. Fee payment required at submission."
    },
    {
      title: "Completeness Review (20 days)",
      description: "Per the Land Use Bylaw, the Development Authority must determine within 20 days whether your application is complete. This timeline may be extended by written agreement."
    },
    {
      title: "Technical Review & Circulation",
      description: "Complete applications are circulated to relevant departments and external agencies. For industrial facilities, this may include Alberta Environment, Transportation, and utility providers."
    },
    {
      title: "Decision (40 days)",
      description: "The Development Authority must make a decision within 40 days of acknowledging a complete application. Decisions are: Approved, Approved with Conditions, or Refused."
    },
    {
      title: "Appeal Period (21 days)",
      description: "After a decision, there is a 21-day appeal period before the permit becomes final. Appeals go to the Subdivision and Development Appeal Board (SDAB)."
    }
  ];

  const requiredDocuments = [
    "Completed Development Permit Application Form",
    "Certificate of Title (current within 30 days)",
    "Site Plan showing building locations, setbacks, access",
    "Floor plans and elevations",
    "Legal land description",
    "Project description and intended use",
    "Proof of land ownership or authorization from owner",
    "Fire Safety Plan",
    "Environmental impact considerations (if applicable)"
  ];

  return (
    <EPSectionWrapper id="municipal" theme="light">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 3 • Municipal Permits"
          badgeIcon={MapPin}
          title="Lamont County Development Permits"
          description="Development permits are required under the Land Use Bylaw before any construction can begin. Understanding the process is critical for project timelines."
        />
      </ScrollReveal>

      {/* Land Use Classification */}
      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
            Land Use Classification
          </h3>
          <p className="text-muted-foreground mb-4">
            Bitcoin mining facilities are typically classified as <strong>Industrial Use</strong> under the Lamont County Land Use Bylaw. 
            Depending on the specific land use district, the use may be:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Permitted Use</h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                Allowed as of right in the district. Development permit is still required but approval is more straightforward.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Discretionary Use</h4>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                May be allowed at the Development Authority's discretion. Additional conditions and public notification may be required.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Step by Step Process */}
      <ScrollReveal delay={150}>
        <h3 className="text-xl font-bold text-foreground mb-6">Development Permit Process</h3>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <EPStepByStep steps={permitSteps} theme="light" />
        </div>
      </ScrollReveal>

      {/* Required Documents */}
      <ScrollReveal delay={200}>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
              Required Documents
            </h3>
            <ul className="space-y-2">
              {requiredDocuments.map((doc, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                  {doc}
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
              Timeline Summary
            </h3>
            <div className="space-y-3">
              {[
                { phase: "Completeness Review", time: "Up to 20 days", note: "From submission" },
                { phase: "Decision Period", time: "Up to 40 days", note: "From acknowledgment" },
                { phase: "Appeal Period", time: "21 days", note: "After decision" },
                { phase: "Total Minimum", time: "60-90 days", note: "Best case scenario" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">{item.phase}</span>
                    <span className="text-xs text-muted-foreground block">{item.note}</span>
                  </div>
                  <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Fee Structure */}
      <ScrollReveal delay={250}>
        <EPCallout 
          title="Development Permit Fees" 
          icon={Calendar}
          variant="cost"
        >
          <p className="mb-3">Lamont County development permit fees are set annually in the Master Rates Bylaw. For industrial facilities:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Base fee:</strong> Varies by project size and complexity</li>
            <li>• <strong>Additional fees:</strong> May apply for variances, circulation to external agencies</li>
            <li>• <strong>Security deposits:</strong> May be required for landscaping, road improvements</li>
          </ul>
          <p className="mt-3 text-xs">
            Contact Lamont County Planning at 780-895-2233 for current fee schedule.
          </p>
        </EPCallout>
      </ScrollReveal>

      {/* Key Insight */}
      <ScrollReveal delay={300}>
        <EPKeyInsight title="45MW Site Experience" type="success" icon={CheckCircle2}>
          <p>For our Lamont County 45MW facility, we engaged with Planning & Development early in the process. 
          Key factors that helped expedite approval:</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Pre-application meeting to confirm industrial zoning compatibility</li>
            <li>• Complete application package submitted on first attempt</li>
            <li>• Proactive engagement with utility providers for letters of support</li>
            <li>• Fire Safety Plan prepared by qualified consultant</li>
          </ul>
        </EPKeyInsight>
      </ScrollReveal>

      {/* Warning */}
      <ScrollReveal delay={350}>
        <EPKeyInsight title="Common Pitfalls" type="warning" icon={AlertTriangle}>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Incomplete applications:</strong> Missing documents restart the 20-day completeness clock</li>
            <li>• <strong>Noise concerns:</strong> Neighbors may object during discretionary use applications</li>
            <li>• <strong>Access issues:</strong> Inadequate road access can delay or prevent approval</li>
            <li>• <strong>Utility availability:</strong> Confirm power availability before land purchase</li>
          </ul>
        </EPKeyInsight>
      </ScrollReveal>

      {/* External Link */}
      <ScrollReveal delay={400}>
        <div className="mt-8 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">Lamont County Planning & Development</h4>
            <p className="text-sm text-muted-foreground">Access forms, bylaws, and contact information</p>
          </div>
          <a 
            href="https://www.lamontcounty.ca/departments/planning-development" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default MunicipalPermitsSection;
