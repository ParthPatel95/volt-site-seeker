import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Zap, FileText } from "lucide-react";

const ArcFlashSafetySection = () => {
  const ppeCategories = [
    { category: 1, calCm2: "4", arc: "4 cal/cm²", clothing: "Arc-rated shirt and pants, safety glasses, hearing protection", color: "bg-green-500" },
    { category: 2, calCm2: "8", arc: "8 cal/cm²", clothing: "Arc-rated shirt and pants, arc flash suit hood, safety glasses, hearing protection, leather gloves", color: "bg-yellow-500" },
    { category: 3, calCm2: "25", arc: "25 cal/cm²", clothing: "Arc flash suit (jacket, pants, hood), arc-rated gloves, safety glasses, hearing protection", color: "bg-orange-500" },
    { category: 4, calCm2: "40", arc: "40 cal/cm²", clothing: "Multi-layer arc flash suit (40+ cal/cm²), arc-rated gloves, balaclava, face shield, hearing protection", color: "bg-red-600" }
  ];

  return (
    <section id="arc-flash" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 11</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Arc Flash Safety
            </h2>
            <p className="text-watt-navy/70 max-w-3xl mx-auto">
              Arc flash events can release enormous energy, causing severe burns, blindness, 
              and death. Understanding arc flash hazards is critical for electrical safety.
            </p>
          </div>
        </ScrollReveal>

        {/* What is Arc Flash */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Understanding Arc Flash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-watt-navy/70">
                    An <strong>arc flash</strong> occurs when current flows through air between 
                    conductors or between a conductor and ground. The air ionizes and becomes 
                    conductive, releasing enormous energy.
                  </p>
                  
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-700 mb-2">Arc Flash Dangers:</h4>
                    <ul className="text-sm text-red-700/80 space-y-1">
                      <li>• <strong>Temperature:</strong> Up to 35,000°F (4× hotter than sun's surface)</li>
                      <li>• <strong>Pressure wave:</strong> Sound levels exceed 140 dB</li>
                      <li>• <strong>Shrapnel:</strong> Molten metal and debris projected at high speed</li>
                      <li>• <strong>Intense light:</strong> Can cause permanent blindness</li>
                      <li>• <strong>Fire:</strong> Ignites clothing and nearby materials</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm mb-1">Common Causes:</h5>
                    <ul className="text-xs text-watt-navy/60 space-y-1">
                      <li>• Accidental contact with energized parts</li>
                      <li>• Dropped tools or foreign objects</li>
                      <li>• Equipment failure or insulation breakdown</li>
                      <li>• Dust, corrosion, or contamination</li>
                      <li>• Improper work procedures</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Arc Flash Energy (Incident Energy)</h4>
                  <p className="text-sm text-watt-navy/70">
                    Arc flash severity is measured in <strong>calories per square centimeter (cal/cm²)</strong>. 
                    1.2 cal/cm² is enough to cause a second-degree burn on exposed skin.
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-watt-light rounded-lg">
                      <h5 className="font-medium text-watt-navy text-sm">Factors Affecting Incident Energy:</h5>
                      <ul className="text-xs text-watt-navy/60 space-y-1 mt-1">
                        <li>• <strong>Available fault current:</strong> Higher = more energy</li>
                        <li>• <strong>Clearing time:</strong> Slower protection = more energy</li>
                        <li>• <strong>Working distance:</strong> Closer = more exposure</li>
                        <li>• <strong>Electrode configuration:</strong> Enclosure type matters</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-semibold text-watt-navy text-sm mb-1">IEEE 1584 Calculation</h5>
                    <p className="text-xs text-watt-navy/70">
                      IEEE 1584 provides equations to calculate incident energy based on 
                      system parameters. An arc flash study applies these to every 
                      electrical panel in the facility.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* PPE Categories */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                PPE Categories (NFPA 70E)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-watt-navy/70 mb-6">
                NFPA 70E defines four PPE categories based on incident energy levels. 
                Workers must wear PPE rated for the hazard level of the equipment being worked on.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ppeCategories.map((ppe) => (
                  <div key={ppe.category} className="p-4 bg-watt-light rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full ${ppe.color} text-white flex items-center justify-center font-bold`}>
                        {ppe.category}
                      </div>
                      <div>
                        <div className="font-bold text-watt-navy">Category {ppe.category}</div>
                        <div className="text-xs text-watt-navy/60">≤ {ppe.arc}</div>
                      </div>
                    </div>
                    <p className="text-xs text-watt-navy/70">{ppe.clothing}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-2">Above Category 4 (&gt;40 cal/cm²)</h5>
                <p className="text-sm text-red-700/80">
                  Work is <strong>NOT PERMITTED</strong> without additional protection measures. 
                  Options include de-energizing equipment, adding faster protection, or using 
                  remote racking/switching systems.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Arc Flash Labeling */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={300}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <FileText className="w-5 h-5 text-watt-bitcoin" />
                  Arc Flash Labels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Every piece of electrical equipment must have an arc flash label 
                  displaying hazard information per NFPA 70E.
                </p>

                <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-500">
                  <div className="text-center mb-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto" />
                    <div className="font-bold text-yellow-700">WARNING - ARC FLASH HAZARD</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded">
                      <span className="text-yellow-700">Incident Energy:</span>
                      <span className="font-bold ml-1">12.5 cal/cm²</span>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-yellow-700">PPE Category:</span>
                      <span className="font-bold ml-1">3</span>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-yellow-700">Arc Flash Boundary:</span>
                      <span className="font-bold ml-1">48 inches</span>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-yellow-700">Working Distance:</span>
                      <span className="font-bold ml-1">18 inches</span>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-white rounded text-xs text-center">
                    <span className="text-yellow-700">Shock Hazard:</span>
                    <span className="font-bold ml-1">480V</span>
                    <span className="text-yellow-700 ml-3">Limited Approach:</span>
                    <span className="font-bold ml-1">42 inches</span>
                  </div>
                </div>

                <div className="p-3 bg-watt-light rounded-lg">
                  <h5 className="font-medium text-watt-navy text-sm mb-1">Label Requirements:</h5>
                  <ul className="text-xs text-watt-navy/60 space-y-1">
                    <li>• Nominal system voltage</li>
                    <li>• Arc flash boundary</li>
                    <li>• Incident energy OR PPE category</li>
                    <li>• Required PPE</li>
                    <li>• Date of study</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <Card className="h-full border-watt-navy/10 shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-watt-navy">
                  <Shield className="w-5 h-5 text-watt-bitcoin" />
                  Reducing Arc Flash Hazards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-watt-navy/70">
                  Several design and operational strategies can reduce arc flash incident energy.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-medium text-watt-success text-sm">Arc-Resistant Switchgear</h5>
                    <p className="text-xs text-watt-navy/60">
                      Contains and vents arc energy away from personnel. 
                      Reduces incident energy to safe levels at front of equipment.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Fast-Acting Protection</h5>
                    <p className="text-xs text-watt-navy/60">
                      Current-limiting fuses or fast breakers clear faults in &lt;0.1 seconds. 
                      Less time = less energy released.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Arc Flash Relay</h5>
                    <p className="text-xs text-watt-navy/60">
                      Detects light from arc and trips breaker in 2-10 ms. 
                      Dramatically reduces incident energy.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Maintenance Mode</h5>
                    <p className="text-xs text-watt-navy/60">
                      Temporarily reduce protection trip settings during maintenance. 
                      Faster clearing = lower incident energy.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-light rounded-lg">
                    <h5 className="font-medium text-watt-navy text-sm">Remote Racking/Switching</h5>
                    <p className="text-xs text-watt-navy/60">
                      Operate equipment from a distance using remote controls. 
                      Increases working distance, reducing exposure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Compliance */}
        <ScrollReveal delay={500}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <FileText className="w-5 h-5 text-watt-bitcoin" />
                Regulatory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">NFPA 70E (US)</h4>
                  <p className="text-sm text-watt-navy/70">
                    "Standard for Electrical Safety in the Workplace" - primary US standard 
                    for arc flash and electrical safety.
                  </p>
                  <ul className="text-xs text-watt-navy/60 space-y-1">
                    <li>• Requires arc flash hazard analysis</li>
                    <li>• Defines PPE requirements</li>
                    <li>• Establishes work practices and procedures</li>
                    <li>• Updated every 3 years</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">CSA Z462 (Canada)</h4>
                  <p className="text-sm text-watt-navy/70">
                    Canadian equivalent to NFPA 70E. Very similar requirements with 
                    some differences in approach boundaries and calculations.
                  </p>
                  <ul className="text-xs text-watt-navy/60 space-y-1">
                    <li>• Adopted by most Canadian jurisdictions</li>
                    <li>• Harmonized with NFPA 70E</li>
                    <li>• Includes both imperial and metric units</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                <h5 className="font-semibold text-watt-navy mb-2">Arc Flash Study Requirements</h5>
                <p className="text-sm text-watt-navy/70">
                  An arc flash study must be performed by a qualified engineer and updated 
                  whenever major system changes occur or at least every 5 years. 
                  The study calculates incident energy at each equipment location and 
                  generates labels. Budget $5,000-$50,000+ depending on system size.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ArcFlashSafetySection;
