import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Scale, Building2, Zap, ShieldCheck, MapPin, ExternalLink, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight, EPContentCard } from './shared';

const RegulatoryLandscapeSection = () => {
  const regulatoryBodies = [
    {
      name: "Alberta Utilities Commission (AUC)",
      role: "Facility Approvals & Rate Regulation",
      description: "The AUC regulates the utilities sector, natural gas and electricity markets in Alberta. For Bitcoin mining facilities, the AUC approval is required for power plants and industrial system designations under Rule 007.",
      responsibilities: [
        "Power plant facility applications",
        "Transmission line approvals",
        "Industrial System Designation (ISD)",
        "Public interest assessments"
      ],
      website: "auc.ab.ca",
      icon: Scale,
      color: "hsl(var(--watt-purple))"
    },
    {
      name: "Alberta Electric System Operator (AESO)",
      role: "Grid Connection & System Access",
      description: "AESO operates Alberta's interconnected electric system and administers the wholesale electricity market. They manage the connection process for all loads over 5MW requiring transmission access.",
      responsibilities: [
        "System Access Service Requests (SASR)",
        "Connection assessments and studies",
        "System impact analysis",
        "Contract administration"
      ],
      website: "aeso.ca",
      icon: Zap,
      color: "hsl(var(--watt-bitcoin))"
    },
    {
      name: "Alberta Energy Regulator (AER)",
      role: "Environmental & Noise Compliance",
      description: "The AER regulates energy development in Alberta. For Bitcoin mining, their Directive 038 sets noise control requirements that apply to industrial facilities near residential areas.",
      responsibilities: [
        "Directive 038 noise compliance",
        "Environmental assessments",
        "Land disturbance approvals",
        "Ongoing monitoring requirements"
      ],
      website: "aer.ca",
      icon: ShieldCheck,
      color: "hsl(var(--watt-success))"
    },
    {
      name: "Municipal Planning Authorities",
      role: "Development Permits & Land Use",
      description: "Local municipalities (like Lamont County) control land use through their Land Use Bylaws. Development permits are required before construction can begin on any industrial facility.",
      responsibilities: [
        "Development permit issuance",
        "Land use bylaw compliance",
        "Subdivision approvals",
        "Building inspections coordination"
      ],
      website: "lamontcounty.ca",
      icon: MapPin,
      color: "hsl(var(--watt-purple))"
    },
    {
      name: "Safety Codes Council",
      role: "Building & Electrical Safety",
      description: "Under the Alberta Safety Codes Act, all construction requires safety code permits. For industrial facilities, this includes building, electrical, gas, and plumbing permits issued through accredited agencies.",
      responsibilities: [
        "Building permit administration",
        "Electrical code enforcement",
        "Inspection scheduling",
        "Occupancy certification"
      ],
      website: "safetycodes.ab.ca",
      icon: Building2,
      color: "hsl(var(--watt-bitcoin))"
    }
  ];

  return (
    <EPSectionWrapper id="regulatory" theme="gradient">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 2 • Regulatory Framework"
          badgeIcon={Scale}
          title="Alberta's Regulatory Landscape"
          description="Understanding the key regulatory bodies that govern Bitcoin mining facility development in Alberta. Each has distinct jurisdiction and requirements."
        />
      </ScrollReveal>

      {/* Regulatory Bodies Grid */}
      <ScrollReveal delay={100}>
        <div className="space-y-6 mb-12">
          {regulatoryBodies.map((body, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${body.color}20` }}
                  >
                    <body.icon className="w-6 h-6" style={{ color: body.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{body.name}</h3>
                        <p className="text-sm font-medium" style={{ color: body.color }}>{body.role}</p>
                      </div>
                      <a 
                        href={`https://${body.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {body.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{body.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {body.responsibilities.map((resp, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                        >
                          {resp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Jurisdiction Overlap */}
      <ScrollReveal delay={200}>
        <EPKeyInsight title="Understanding Jurisdictional Overlap" type="insight">
          <p className="mb-3">Multiple regulatory bodies often have overlapping requirements. For a 45MW Bitcoin mining facility:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-2">Before Construction</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Municipal Development Permit (Lamont County)</li>
                <li>• AESO System Access Service Request</li>
                <li>• AUC facility application (if required)</li>
                <li>• Safety Code permit applications</li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-2">During Operations</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• AER Directive 038 noise monitoring</li>
                <li>• AESO metering and settlement</li>
                <li>• Municipal business licensing</li>
                <li>• Ongoing safety inspections</li>
              </ul>
            </div>
          </div>
        </EPKeyInsight>
      </ScrollReveal>

      {/* Key Contacts */}
      <ScrollReveal delay={300}>
        <h3 className="text-xl font-bold text-foreground mb-4 mt-12">Key Contact Information</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              org: "AESO Customer Connections", 
              phone: "403-539-2793", 
              email: "customer.connections@aeso.ca",
              note: "Grid connection inquiries"
            },
            { 
              org: "Lamont County Planning", 
              phone: "780-895-2233", 
              email: "planning@lamontcounty.ca",
              note: "Development permits"
            },
            { 
              org: "The Inspections Group Inc.", 
              phone: "780-454-5048", 
              email: "info@tigroupinc.com",
              note: "Safety code permits (Lamont County)"
            },
          ].map((contact, idx) => (
            <EPContentCard key={idx} borderColor="hsl(var(--watt-purple))">
              <h4 className="font-semibold text-foreground mb-2">{contact.org}</h4>
              <p className="text-xs text-muted-foreground mb-3">{contact.note}</p>
              <div className="space-y-2">
                <a href={`tel:${contact.phone.replace(/-/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </a>
              </div>
            </EPContentCard>
          ))}
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default RegulatoryLandscapeSection;
