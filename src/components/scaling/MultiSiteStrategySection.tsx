import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Globe, MapPin, Shield, BarChart3, Network, Zap } from "lucide-react";

export const MultiSiteStrategySection = () => {
  const diversificationBenefits = [
    {
      icon: Shield,
      title: "Risk Mitigation",
      description: "Geographic diversification protects against regional power outages, natural disasters, and regulatory changes",
      metrics: ["Reduced single-point failure", "Portfolio resilience", "Regulatory arbitrage"]
    },
    {
      icon: Zap,
      title: "Power Optimization",
      description: "Access different power markets with varying pricing structures and renewable energy availability",
      metrics: ["Load balancing", "Price arbitrage", "Renewable access"]
    },
    {
      icon: BarChart3,
      title: "Operational Efficiency",
      description: "Centralized management with local execution enables best practices sharing and economies of scale",
      metrics: ["Shared services", "Knowledge transfer", "Bulk purchasing"]
    },
    {
      icon: Network,
      title: "Network Strength",
      description: "Multiple network connections and pool relationships reduce latency and orphan block risk",
      metrics: ["Redundant connectivity", "Lower latency", "Pool diversity"]
    }
  ];

  const siteProfiles = [
    {
      region: "North America",
      locations: ["Texas (ERCOT)", "Alberta (AESO)", "Quebec", "Midwest ISO"],
      advantages: "Deregulated markets, abundant power, stable regulations",
      powerCost: "$0.03-0.06/kWh",
      climate: "Variable - excellent in north"
    },
    {
      region: "Northern Europe",
      locations: ["Iceland", "Norway", "Sweden", "Finland"],
      advantages: "100% renewable, cold climate, stable governments",
      powerCost: "$0.02-0.05/kWh",
      climate: "Excellent - natural cooling"
    },
    {
      region: "Middle East",
      locations: ["UAE", "Oman", "Saudi Arabia"],
      advantages: "Cheap power, government support, strategic location",
      powerCost: "$0.02-0.04/kWh",
      climate: "Challenging - high cooling costs"
    },
    {
      region: "South America",
      locations: ["Paraguay", "Argentina", "Chile"],
      advantages: "Hydroelectric surplus, emerging markets, low costs",
      powerCost: "$0.02-0.04/kWh",
      climate: "Variable by region"
    }
  ];

  const managementModel = [
    {
      layer: "Corporate HQ",
      functions: ["Strategy & Capital Allocation", "Investor Relations", "Treasury & Risk", "M&A"],
      color: "bg-watt-navy"
    },
    {
      layer: "Regional Operations",
      functions: ["Power Procurement", "Regulatory Compliance", "Site Development", "Local Partnerships"],
      color: "bg-watt-success"
    },
    {
      layer: "Site Management",
      functions: ["24/7 Operations", "Maintenance", "Security", "Performance Optimization"],
      color: "bg-watt-bitcoin"
    }
  ];

  return (
    <section id="multi-site" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Multi-Site Strategy
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building a geographically diversified mining portfolio for resilience and optimization.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {diversificationBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-market-positive/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-market-positive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{benefit.description}</p>
                <div className="space-y-1">
                  {benefit.metrics.map((metric, i) => (
                    <div key={i} className="text-xs text-market-positive font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-market-positive rounded-full"></div>
                      {metric}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Global Mining Regions</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {siteProfiles.map((profile, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-md border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">{profile.region}</h4>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.locations.map((location, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-foreground"
                    >
                      <MapPin className="w-3 h-3" />
                      {location}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{profile.advantages}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-market-positive/10 rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground">{profile.powerCost}</div>
                    <div className="text-xs text-muted-foreground">Power Cost</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground">{profile.climate}</div>
                    <div className="text-xs text-muted-foreground">Climate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Multi-Site Management Model</h3>
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="space-y-6">
              {managementModel.map((layer, index) => (
                <div key={index} className="relative">
                  <div className={`${layer.color} text-white rounded-xl p-6`}>
                    <h4 className="text-lg font-bold mb-3">{layer.layer}</h4>
                    <div className="flex flex-wrap gap-3">
                      {layer.functions.map((func, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white/20 rounded-lg text-sm"
                        >
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                  {index < managementModel.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-market-positive/10 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3">Key Success Factors</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">Standardization</strong>
                  <p>Consistent equipment, processes, and KPIs across all sites</p>
                </div>
                <div>
                  <strong className="text-foreground">Communication</strong>
                  <p>Real-time dashboards and regular cross-site coordination</p>
                </div>
                <div>
                  <strong className="text-foreground">Local Expertise</strong>
                  <p>Regional teams with local market and regulatory knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
