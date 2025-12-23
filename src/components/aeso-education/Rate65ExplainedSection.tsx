import { useState } from 'react';
import { Zap, DollarSign, TrendingDown, Shield, Scale, ArrowUpRight, Building2, CheckCircle, Calculator, FileText, Info, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const benefits = [
  {
    icon: TrendingDown,
    title: 'Bypass Distribution',
    description: 'Eliminate ~$26/MWh in distribution charges by connecting directly to the transmission grid',
    savings: 'Up to 90% lower delivery costs',
    color: 'text-green-600'
  },
  {
    icon: Zap,
    title: 'Direct Pool Access',
    description: 'As a Self-Retailer, access wholesale pool prices without retailer markup or hedging premiums',
    savings: 'Real-time market pricing',
    color: 'text-watt-bitcoin'
  },
  {
    icon: DollarSign,
    title: '12CP Optimization',
    description: 'Full transmission cost reduction through strategic peak avoidance during coincident peaks',
    savings: 'Up to 85% transmission savings',
    color: 'text-blue-600'
  },
  {
    icon: Calculator,
    title: 'Demand-Based Billing',
    description: 'Predictable $7.11/kW/month demand charge instead of volatile volumetric rates',
    savings: 'Budget certainty',
    color: 'text-purple-600'
  },
  {
    icon: Shield,
    title: 'Power Quality',
    description: 'Direct transmission connection provides higher reliability and fewer voltage fluctuations',
    savings: '99.99% grid reliability',
    color: 'text-indigo-600'
  },
  {
    icon: Scale,
    title: 'Unlimited Scalability',
    description: 'No upper limit on capacity — scale from 5MW to 500MW+ without changing rate structure',
    savings: 'Future-proof infrastructure',
    color: 'text-teal-600'
  }
];

const rateComparison = [
  {
    rate: 'Rate 11',
    type: 'Residential',
    delivery: '$45-55/MWh',
    transmission: 'Bundled',
    distribution: 'Bundled',
    eligible12CP: false,
    selfRetailer: false,
    minLoad: '< 1 MW',
    highlight: false
  },
  {
    rate: 'Rate 63',
    type: 'Large General Service',
    delivery: '$25-35/MWh',
    transmission: '~$15/MWh',
    distribution: '~$15/MWh',
    eligible12CP: 'Limited',
    selfRetailer: 'Possible',
    minLoad: '> 150 kW',
    highlight: false
  },
  {
    rate: 'Rate 65',
    type: 'Transmission Connected',
    delivery: '$2-5/MWh',
    transmission: '~$1.50/MWh',
    distribution: 'Bypassed',
    eligible12CP: true,
    selfRetailer: true,
    minLoad: '> 5 MW',
    highlight: true
  }
];

const requirements = [
  {
    title: 'Infrastructure Requirements',
    items: [
      'Own or lease transmission substation (25kV, 69kV, 138kV, or 240kV)',
      'Customer-owned transformers stepping down to facility voltage',
      'Metering equipment meeting AESO standards',
      'Protection and control systems for grid compliance'
    ]
  },
  {
    title: 'AESO Interconnection Process',
    items: [
      'Submit System Access Service Request (SASR) to AESO',
      'Complete Facility Technical Requirements assessment',
      'Enter into Rate STS Service Agreement',
      'Coordinate with Transmission Facility Owner (TFO)'
    ]
  },
  {
    title: 'FortisAlberta Application',
    items: [
      'Apply for Rate 65 - Transmission Connected service',
      'Provide single-line diagrams and facility specifications',
      'Complete connection cost estimates',
      'Finalize Distribution Connection Agreement'
    ]
  },
  {
    title: 'Typical Timeline',
    items: [
      'Initial application & feasibility: 2-3 months',
      'Engineering & design: 6-9 months',
      'Construction & commissioning: 6-12 months',
      'Total timeline: 12-24 months for greenfield sites'
    ]
  }
];

export const Rate65ExplainedSection = () => {
  const [facilityMW, setFacilityMW] = useState(50);
  const [hoursPerYear, setHoursPerYear] = useState(8000);
  const [capacityFactor, setCapacityFactor] = useState(90);

  // Calculate savings
  const annualMWh = facilityMW * hoursPerYear * (capacityFactor / 100);
  const rate63Cost = annualMWh * 30; // ~$30/MWh average for Rate 63
  const rate65Cost = annualMWh * 3.5; // ~$3.50/MWh for Rate 65 delivery only
  const annualSavings = rate63Cost - rate65Cost;
  const savingsPercent = ((annualSavings / rate63Cost) * 100).toFixed(0);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-muted to-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <Badge className="bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/20 mb-4">
              <FileText className="w-3 h-3 mr-1" />
              FortisAlberta Transmission Connected Service
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Rate 65: The Industrial Advantage
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              For large industrial loads, connecting directly to the transmission grid via Rate 65 
              unlocks massive savings by bypassing distribution infrastructure entirely.
            </p>
          </div>
        </ScrollReveal>

        {/* What is Rate 65 */}
        <ScrollReveal delay={0.1}>
          <Card className="mb-10 border-border shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                What is Rate 65?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Transmission vs Distribution Connected</h4>
                  <p className="text-muted-foreground mb-4">
                    Most commercial customers connect to the <strong>distribution grid</strong> (lower voltage, 
                    local utility infrastructure). Rate 65 customers connect directly to the <strong>transmission 
                    grid</strong> (high voltage, provincial backbone), bypassing distribution entirely.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 font-medium text-foreground">240 kV</span>
                      <div className="flex-1 h-3 bg-watt-bitcoin/20 rounded" />
                      <span className="text-muted-foreground">Bulk Transmission</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 font-medium text-foreground">138 kV</span>
                      <div className="flex-1 h-3 bg-watt-bitcoin/40 rounded" />
                      <span className="text-muted-foreground">Regional Transmission</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 font-medium text-foreground">69 kV</span>
                      <div className="flex-1 h-3 bg-watt-bitcoin/60 rounded" />
                      <span className="text-muted-foreground">Sub-Transmission</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 font-medium text-foreground">25 kV</span>
                      <div className="flex-1 h-3 bg-watt-bitcoin/80 rounded" />
                      <span className="text-muted-foreground">Rate 65 Minimum</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Eligibility Requirements</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong>5 MW+ load</strong> — Minimum demand to justify transmission connection
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong>Own substation infrastructure</strong> — Customer provides transformers, switchgear
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong>Direct transmission tap</strong> — Physical connection to transmission line
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong>AESO compliance</strong> — Meet Facility Technical Requirements
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Rate Comparison Table */}
        <ScrollReveal delay={0.15}>
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Rate Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-4 text-left rounded-tl-lg">Rate</th>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-left">Delivery Cost</th>
                    <th className="p-4 text-left">Min Load</th>
                    <th className="p-4 text-center">12CP Eligible</th>
                    <th className="p-4 text-center rounded-tr-lg">Self-Retailer</th>
                  </tr>
                </thead>
                <tbody>
                  {rateComparison.map((rate, idx) => (
                    <tr 
                      key={rate.rate}
                      className={`border-b border-border ${
                        rate.highlight 
                          ? 'bg-watt-bitcoin/5 font-medium' 
                          : idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'
                      }`}
                    >
                      <td className="p-4">
                        <span className={rate.highlight ? 'text-watt-bitcoin font-bold' : 'text-foreground'}>
                          {rate.rate}
                        </span>
                        {rate.highlight && (
                          <Badge className="ml-2 bg-watt-bitcoin text-white text-xs">Best Value</Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{rate.type}</td>
                      <td className="p-4">
                        <span className={rate.highlight ? 'text-green-600 font-bold' : 'text-foreground'}>
                          {rate.delivery}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{rate.minLoad}</td>
                      <td className="p-4 text-center">
                        {rate.eligible12CP === true ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : rate.eligible12CP === 'Limited' ? (
                          <span className="text-yellow-600 text-sm">Limited</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {rate.selfRetailer === true ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : rate.selfRetailer === 'Possible' ? (
                          <span className="text-yellow-600 text-sm">Possible</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-2 text-center">
              📊 Based on FortisAlberta 2024 Approved Rate Schedule | Actual costs vary by usage profile
            </p>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <ScrollReveal delay={0.2}>
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Key Benefits of Rate 65</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, idx) => (
                <Card 
                  key={benefit.title}
                  className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-muted ${benefit.color}`}>
                        <benefit.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                        <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                          {benefit.savings}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Savings Calculator */}
        <ScrollReveal delay={0.25}>
          <Card className="mb-10 border-watt-bitcoin/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 text-white">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Rate 65 Savings Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-foreground font-medium mb-2 block">
                      Facility Size: <span className="text-watt-bitcoin font-bold">{facilityMW} MW</span>
                    </Label>
                    <Slider
                      value={[facilityMW]}
                      onValueChange={(v) => setFacilityMW(v[0])}
                      min={5}
                      max={500}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                      <span>5 MW</span>
                      <span>500 MW</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground font-medium mb-2 block">
                      Operating Hours/Year: <span className="text-watt-bitcoin font-bold">{hoursPerYear.toLocaleString()}</span>
                    </Label>
                    <Slider
                      value={[hoursPerYear]}
                      onValueChange={(v) => setHoursPerYear(v[0])}
                      min={2000}
                      max={8760}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                      <span>2,000 hrs</span>
                      <span>8,760 hrs (24/7)</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground font-medium mb-2 block">
                      Capacity Factor: <span className="text-watt-bitcoin font-bold">{capacityFactor}%</span>
                    </Label>
                    <Slider
                      value={[capacityFactor]}
                      onValueChange={(v) => setCapacityFactor(v[0])}
                      min={50}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-4">Annual Cost Comparison</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-muted-foreground">Annual Energy Consumption</span>
                      <span className="font-bold text-foreground">{(annualMWh / 1000).toFixed(0)} GWh</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rate 63 Delivery Cost</span>
                      <span className="text-red-600 font-medium">${(rate63Cost / 1000000).toFixed(1)}M/yr</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rate 65 Delivery Cost</span>
                      <span className="text-green-600 font-medium">${(rate65Cost / 1000000).toFixed(1)}M/yr</span>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 font-semibold">Annual Savings</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            ${(annualSavings / 1000000).toFixed(1)}M
                          </span>
                          <span className="block text-sm text-green-600">({savingsPercent}% reduction)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground/50 mt-4">
                    * Illustrative only. Excludes energy commodity, transmission (12CP), riders, and taxes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Requirements Accordion */}
        <ScrollReveal delay={0.3}>
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Requirements & Process</h3>
            <Accordion type="single" collapsible className="space-y-2">
              {requirements.map((req, idx) => (
                <AccordionItem 
                  key={req.title} 
                  value={`item-${idx}`}
                  className="bg-background border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-foreground font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {req.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="space-y-2 pl-8">
                      {req.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>

        {/* WattByte Advantage */}
        <ScrollReveal delay={0.35}>
          <Card className="border-2 border-watt-bitcoin/30 bg-gradient-to-br from-watt-bitcoin/5 to-background shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="p-4 rounded-xl bg-watt-bitcoin/10">
                  <Lightbulb className="w-10 h-10 text-watt-bitcoin" />
                </div>
                <div className="flex-1">
                  <Badge className="bg-watt-bitcoin text-white mb-3">WattByte Advantage</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Alberta Heartland 135: Triple Optimization Stack
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Our flagship 135MW facility combines <strong>Rate 65</strong> transmission connection 
                    with <strong>Self-Retailer</strong> status and <strong>12CP optimization</strong> — 
                    the most aggressive cost reduction strategy available in Alberta.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <div className="text-2xl font-bold text-watt-bitcoin">$2-5</div>
                      <div className="text-xs text-muted-foreground">/MWh Delivery (Rate 65)</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <div className="text-xs text-muted-foreground">Transmission Savings (12CP)</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <div className="text-2xl font-bold text-blue-600">$0</div>
                      <div className="text-xs text-muted-foreground">Retailer Markup (Self-Retailer)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Source Badge */}
        <div className="mt-6 text-center">
          <Badge variant="outline" className="text-muted-foreground border-border">
            <FileText className="w-3 h-3 mr-1" />
            Sources: FortisAlberta 2024 Rate Schedule | AESO Tariff Regulation | Industry Estimates
          </Badge>
        </div>
      </div>
    </section>
  );
};
