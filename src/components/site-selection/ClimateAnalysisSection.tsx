import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Thermometer, Wind, Droplets, Sun, Calculator } from 'lucide-react';

const ClimateAnalysisSection = () => {
  const [selectedClimate, setSelectedClimate] = useState<string>('cold');
  const [ambientTemp, setAmbientTemp] = useState<number>(15);

  const climateProfiles = {
    cold: {
      name: "Cold Climate",
      examples: "Alberta, Iceland, Norway, Wyoming",
      avgTemp: "-5 to 15°C (23-59°F)",
      advantages: [
        "Free-air cooling 8-10 months/year",
        "Lower PUE (1.1-1.2 achievable)",
        "Extended hardware lifespan",
        "Reduced cooling CAPEX"
      ],
      challenges: [
        "Extreme cold protection needed",
        "Snow/ice management",
        "Seasonal road access",
        "Remote locations"
      ],
      pueRange: "1.10 - 1.25",
      coolingStrategy: "Direct air + economizer"
    },
    temperate: {
      name: "Temperate Climate",
      examples: "Texas, Kentucky, Paraguay",
      avgTemp: "15 to 25°C (59-77°F)",
      advantages: [
        "Year-round operations",
        "Good infrastructure access",
        "Moderate cooling costs",
        "Workforce availability"
      ],
      challenges: [
        "Summer cooling peaks",
        "Mixed cooling strategies needed",
        "Higher energy for cooling"
      ],
      pueRange: "1.25 - 1.45",
      coolingStrategy: "Evaporative + mechanical"
    },
    hot: {
      name: "Hot Climate",
      examples: "UAE, West Texas, Arizona",
      avgTemp: "25 to 45°C (77-113°F)",
      advantages: [
        "Cheap land availability",
        "Solar PPA opportunities",
        "Less permitting friction",
        "Low humidity"
      ],
      challenges: [
        "High cooling energy demand",
        "PUE > 1.4 typical",
        "Water scarcity",
        "Hardware thermal stress"
      ],
      pueRange: "1.40 - 1.70",
      coolingStrategy: "Mechanical chillers required"
    }
  };

  // Simple PUE estimation based on ambient temperature
  const estimatePUE = (temp: number) => {
    if (temp <= 10) return 1.12;
    if (temp <= 20) return 1.25;
    if (temp <= 30) return 1.40;
    if (temp <= 40) return 1.55;
    return 1.70;
  };

  const estimatedPUE = estimatePUE(ambientTemp);
  const coolingOverhead = ((estimatedPUE - 1) * 100).toFixed(0);

  const climateData = climateProfiles[selectedClimate as keyof typeof climateProfiles];

  return (
    <section id="climate" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Climate Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Climate Impact on Mining Economics
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Ambient temperature directly impacts cooling costs, PUE, and hardware longevity. 
              A 10°C difference can mean 15-20% variation in operating costs.
            </p>
          </div>
        </ScrollReveal>

        {/* Climate Selector */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(climateProfiles).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => setSelectedClimate(key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedClimate === key
                    ? 'bg-watt-purple text-white shadow-lg'
                    : 'bg-gray-100 text-watt-navy hover:bg-watt-purple/10'
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Climate Profile Card */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-watt-purple/10 to-watt-bitcoin/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-watt-purple/20 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-watt-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">{climateData.name}</h3>
                  <p className="text-sm text-watt-navy/60">{climateData.examples}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 rounded-xl p-4">
                  <div className="text-sm text-watt-navy/60 mb-1">Avg Temperature</div>
                  <div className="text-lg font-bold text-watt-navy">{climateData.avgTemp}</div>
                </div>
                <div className="bg-white/60 rounded-xl p-4">
                  <div className="text-sm text-watt-navy/60 mb-1">Typical PUE</div>
                  <div className="text-lg font-bold text-watt-success">{climateData.pueRange}</div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-sm text-watt-navy/60 mb-1">Recommended Cooling</div>
                <div className="font-medium text-watt-navy">{climateData.coolingStrategy}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-watt-success/10 border border-watt-success/20 rounded-xl p-6">
                <h4 className="font-semibold text-watt-success mb-3 flex items-center gap-2">
                  <Sun className="w-5 h-5" /> Advantages
                </h4>
                <ul className="space-y-2">
                  {climateData.advantages.map((adv, idx) => (
                    <li key={idx} className="text-sm text-watt-navy/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-watt-success rounded-full" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                  <Wind className="w-5 h-5" /> Challenges
                </h4>
                <ul className="space-y-2">
                  {climateData.challenges.map((ch, idx) => (
                    <li key={idx} className="text-sm text-watt-navy/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      {ch}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* PUE Calculator */}
        <ScrollReveal delay={300}>
          <div className="bg-watt-navy rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5 text-watt-bitcoin" />
              PUE Impact Calculator
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-white/70 mb-2">Average Ambient Temperature (°C)</label>
                <input
                  type="range"
                  min="-10"
                  max="45"
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-white/50 mt-1">
                  <span>-10°C</span>
                  <span className="text-watt-bitcoin font-bold">{ambientTemp}°C ({(ambientTemp * 9/5 + 32).toFixed(0)}°F)</span>
                  <span>45°C</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-watt-success">{estimatedPUE.toFixed(2)}</div>
                  <div className="text-sm text-white/60">Estimated PUE</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-watt-bitcoin">{coolingOverhead}%</div>
                  <div className="text-sm text-white/60">Cooling Overhead</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/70 text-center">
                <strong className="text-watt-bitcoin">Impact:</strong> For a 100 MW facility at $0.04/kWh, 
                every 0.1 PUE improvement saves approximately <span className="text-watt-success font-bold">$350,000/year</span>
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Water & Humidity */}
        <ScrollReveal delay={400}>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-watt-navy mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Water Availability
              </h4>
              <p className="text-sm text-watt-navy/70 mb-4">
                Evaporative cooling (most efficient in hot climates) requires significant water:
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-watt-navy">Air-cooled only</span>
                  <span className="font-bold text-watt-success">0 gallons/MW/day</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-watt-navy">Evaporative cooling</span>
                  <span className="font-bold text-blue-500">2,000-5,000 gal/MW/day</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-watt-navy">Wet cooling towers</span>
                  <span className="font-bold text-watt-bitcoin">5,000-10,000 gal/MW/day</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-watt-navy mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5 text-watt-purple" />
                Humidity Considerations
              </h4>
              <p className="text-sm text-watt-navy/70 mb-4">
                Relative humidity affects cooling efficiency and hardware corrosion:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-watt-success/10 border border-watt-success/20 rounded-lg">
                  <div className="font-medium text-watt-success">Ideal: 30-50% RH</div>
                  <div className="text-xs text-watt-navy/60">Optimal for evaporative cooling and hardware</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-600">Caution: &gt;70% RH</div>
                  <div className="text-xs text-watt-navy/60">Reduced evaporative efficiency, condensation risk</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-500">Avoid: &lt;20% RH</div>
                  <div className="text-xs text-watt-navy/60">Static discharge risk, dust management issues</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ClimateAnalysisSection;
