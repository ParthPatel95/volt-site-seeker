import React from 'react';
import { Flame, Shield, HardHat, AlertTriangle, FileText } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import CitedStatistic from '@/components/academy/CitedStatistic';
import { ARC_FLASH_STANDARDS, ARC_FLASH_PPE, DATA_SOURCES } from '@/constants/industry-standards';

const ArcFlashSection = () => {
  const ppeCategories = Object.values(ARC_FLASH_PPE);

  const incidentEnergies = [
    { location: "480V MCC", distance: "18 inches", energy: "4-12 cal/cm²", typical: "1-3 sec clearing" },
    { location: "480V Switchboard", distance: "18 inches", energy: "8-25 cal/cm²", typical: "Main breaker" },
    { location: "15kV Switchgear", distance: "36 inches", energy: "15-40 cal/cm²", typical: "Relay protected" },
    { location: "25kV Switchgear", distance: "36 inches", energy: "25-50+ cal/cm²", typical: "Utility metering" }
  ];

  const labelRequirements = [
    "Nominal system voltage",
    "Arc flash boundary",
    "Available incident energy and working distance OR PPE category",
    "Limited approach boundary",
    "Restricted approach boundary (if applicable)",
    "Equipment identification"
  ];

  return (
    <section id="arc-flash" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium mb-4">
              Critical Safety
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Arc Flash Safety
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Arc flash incidents release explosive energy capable of severe burns and fatalities—
              understanding hazards and protection requirements is essential for all personnel.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 mb-16">
            <div className="flex items-start gap-4">
              <Flame className="w-10 h-10 text-destructive shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">What is Arc Flash?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      An arc flash is an explosive release of energy caused by an electrical arc between 
                      conductors or to ground. Temperatures can reach{' '}
                      <CitedStatistic
                        value={ARC_FLASH_STANDARDS.ARC_TEMPERATURE_F.toLocaleString()}
                        unit="°F"
                        label="Maximum arc flash temperature"
                        source={DATA_SOURCES.NFPA.name}
                        sourceUrl={DATA_SOURCES.NFPA.url}
                        variant="danger"
                        size="sm"
                      />
                      —four times hotter than the sun's surface.
                    </p>
                    <h4 className="font-semibold text-foreground mb-2">Hazards Include:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Burns from radiant heat and molten metal</li>
                      <li>• Blast pressure (up to{' '}
                        <CitedStatistic
                          value={ARC_FLASH_STANDARDS.BLAST_PRESSURE_MAX.toLocaleString()}
                          unit="lbs/ft²"
                          label="Maximum blast pressure from arc flash"
                          source={DATA_SOURCES.NFPA.name}
                          size="sm"
                          variant="default"
                        />)
                      </li>
                      <li>• Shrapnel from vaporized conductors</li>
                      <li>• Hearing damage from sound blast ({ARC_FLASH_STANDARDS.SOUND_LEVEL_DB}+ dB)</li>
                      <li>• Vision damage from intense light</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Common Causes:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Accidental contact with energized parts</li>
                      <li>• Dropped tools or equipment</li>
                      <li>• Equipment failure or malfunction</li>
                      <li>• Contamination (dust, moisture, vermin)</li>
                      <li>• Improper work procedures</li>
                      <li>• Inadequate maintenance</li>
                    </ul>
                    <div className="mt-4 p-3 bg-card rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">NFPA 70E Reference:</span> Requires 
                        arc flash risk assessment, PPE selection, labeling, and training for all 
                        personnel working on or near energized electrical equipment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              PPE Categories (NFPA 70E Table 130.7(C)(15))
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ppeCategories.map((cat, index) => (
                <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-watt-bitcoin/50 transition-colors">
                  <div className={`p-4 bg-${cat.color}`}>
                    <div className="flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">Category {index + 1}</span>
                    </div>
                    <div className="text-white/90 text-lg font-semibold mt-1">
                      <CitedStatistic
                        value={cat.calRating}
                        unit="cal/cm²"
                        label={`PPE Category ${index + 1} minimum arc rating`}
                        source={DATA_SOURCES.NFPA.name}
                        sourceUrl={DATA_SOURCES.NFPA.url}
                        size="sm"
                        variant="default"
                        className="text-white"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Clothing:</span>
                        <p className="text-foreground">{cat.clothing}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Additional PPE:</span>
                        <p className="text-foreground">{cat.ppe}</p>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Typical:</span>
                        <p className="text-foreground">{cat.typical}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Typical Incident Energies</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Location</th>
                      <th className="text-left py-2 text-muted-foreground">Distance</th>
                      <th className="text-left py-2 text-muted-foreground">Energy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentEnergies.map((ie, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-2 font-medium text-foreground">{ie.location}</td>
                        <td className="py-2 text-muted-foreground">{ie.distance}</td>
                        <td className="py-2">
                          <span className={`font-medium ${
                            parseInt(ie.energy) <= 8 ? 'text-amber-500' :
                            parseInt(ie.energy) <= 25 ? 'text-orange-500' :
                            'text-destructive'
                          }`}>{ie.energy}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Actual values depend on available fault current, clearing time, electrode 
                configuration, and working distance. Always use site-specific calculations.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Label Requirements</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                NFPA 70E requires arc flash labels on electrical equipment where energized work 
                may be performed. Labels must include:
              </p>
              <div className="space-y-2">
                {labelRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Shield className="w-4 h-4 text-watt-bitcoin shrink-0" />
                    <span className="text-sm text-foreground">{req}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Inspection Requirement:</span> Arc 
                  flash studies should be updated every{' '}
                  <CitedStatistic
                    value={ARC_FLASH_STANDARDS.STUDY_UPDATE_YEARS}
                    unit="years"
                    label="NFPA 70E recommended arc flash study update interval"
                    source={DATA_SOURCES.NFPA.name}
                    size="sm"
                    variant="bitcoin"
                  />{' '}
                  or when significant changes are made to the electrical system.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-bold">Mining Facility Best Practices</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-watt-bitcoin">Engineering Controls</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Use current-limiting fuses</li>
                  <li>• Install arc-resistant switchgear</li>
                  <li>• Minimize fault clearing time</li>
                  <li>• Remote racking and switching</li>
                  <li>• Maintenance mode settings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-watt-bitcoin">Administrative Controls</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Energized work permits</li>
                  <li>• Job briefings required</li>
                  <li>• Qualified personnel only</li>
                  <li>• Lockout/tagout procedures</li>
                  <li>• Regular training updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-watt-bitcoin">PPE Program</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Proper PPE for hazard level</li>
                  <li>• Regular inspection of equipment</li>
                  <li>• Proper storage and care</li>
                  <li>• Replace damaged items</li>
                  <li>• Training on use and limitations</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ArcFlashSection;
