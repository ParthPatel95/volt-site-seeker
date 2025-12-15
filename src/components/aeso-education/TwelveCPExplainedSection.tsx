import { useEffect, useState, useRef } from 'react';
import { PiggyBank, Calendar, Clock, DollarSign, Calculator, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

const monthlyPeaks = [
  { month: 'Jan', typicalHour: '17:00-18:00', typicalTemp: '-25°C', risk: 'high' },
  { month: 'Feb', typicalHour: '17:00-18:00', typicalTemp: '-20°C', risk: 'high' },
  { month: 'Mar', typicalHour: '18:00-19:00', typicalTemp: '-5°C', risk: 'medium' },
  { month: 'Apr', typicalHour: '19:00-20:00', typicalTemp: '5°C', risk: 'low' },
  { month: 'May', typicalHour: '19:00-20:00', typicalTemp: '15°C', risk: 'low' },
  { month: 'Jun', typicalHour: '15:00-16:00', typicalTemp: '28°C', risk: 'medium' },
  { month: 'Jul', typicalHour: '15:00-16:00', typicalTemp: '30°C', risk: 'medium' },
  { month: 'Aug', typicalHour: '15:00-16:00', typicalTemp: '28°C', risk: 'medium' },
  { month: 'Sep', typicalHour: '18:00-19:00', typicalTemp: '15°C', risk: 'low' },
  { month: 'Oct', typicalHour: '17:00-18:00', typicalTemp: '5°C', risk: 'medium' },
  { month: 'Nov', typicalHour: '17:00-18:00', typicalTemp: '-10°C', risk: 'high' },
  { month: 'Dec', typicalHour: '17:00-18:00', typicalTemp: '-20°C', risk: 'high' },
];

export const TwelveCPExplainedSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [facilityMW, setFacilityMW] = useState(135);
  const [avoidedPeaks, setAvoidedPeaks] = useState(12);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Calculations
  const transmissionAdder = 11.73; // CAD per MWh
  const hoursPerYear = 8760;
  const baseTransmissionCost = facilityMW * transmissionAdder * hoursPerYear;
  const reductionPercent = (avoidedPeaks / 12) * 100;
  const annualSavings = baseTransmissionCost * (reductionPercent / 100);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <PiggyBank className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Cost Reduction Strategy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Understanding <span className="text-watt-bitcoin">12CP</span> (12 Coincident Peak)
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            The single most impactful cost-saving opportunity for large industrial loads in Alberta
          </p>
        </div>

        {/* What is 12CP */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <h3 className="text-2xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-watt-bitcoin" />
              What is 12CP?
            </h3>
            
            <div className="space-y-4 mb-6">
              <p className="text-watt-navy/70">
                <strong className="text-watt-navy">12CP (12 Coincident Peak)</strong> is how AESO allocates transmission costs 
                among industrial consumers. Your share of the ~$2B annual transmission cost is based on your demand 
                during the 12 monthly system peaks.
              </p>
              <p className="text-watt-navy/70">
                Each month, AESO identifies the single hour when provincial demand is highest. Your load during 
                that hour determines your transmission bill for the entire year.
              </p>
            </div>

            {/* Transmission Adder Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-bitcoin/10 to-amber-50 border border-watt-bitcoin/30 mb-6">
              <h4 className="text-lg font-bold text-watt-navy mb-2">Transmission Adder</h4>
              <div className="text-4xl font-bold text-watt-bitcoin mb-2">
                $11.73 <span className="text-lg text-watt-navy/70">CAD/MWh</span>
              </div>
              <p className="text-sm text-watt-navy/70">
                Added to every MWh consumed — but reducible by avoiding 12CP hours
              </p>
            </div>

            {/* Key Points */}
            <div className="space-y-3">
              {[
                'Each of the 12 monthly peaks contributes ~8.33% to your transmission bill',
                'Avoiding ALL 12 peaks = 100% transmission cost reduction',
                'Even partial reduction (6 peaks) = 50% savings',
                'Bitcoin mining\'s flexible load is IDEAL for 12CP avoidance',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Calendar Heat Map */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-watt-bitcoin" />
              When Do Peaks Typically Occur?
            </h3>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {monthlyPeaks.map((peak, i) => (
                <div 
                  key={i}
                  className={`p-3 rounded-lg text-center transition-all hover:scale-105 cursor-pointer ${
                    peak.risk === 'high' 
                      ? 'bg-red-100 border border-red-300' 
                      : peak.risk === 'medium'
                        ? 'bg-amber-100 border border-amber-300'
                        : 'bg-green-100 border border-green-300'
                  }`}
                >
                  <p className="font-bold text-watt-navy text-sm">{peak.month}</p>
                  <p className="text-xs text-watt-navy/70">{peak.typicalHour}</p>
                  <p className="text-xs text-watt-navy/50">{peak.typicalTemp}</p>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-200 border border-red-400" />
                <span className="text-xs text-watt-navy/70">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-200 border border-amber-400" />
                <span className="text-xs text-watt-navy/70">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-200 border border-green-400" />
                <span className="text-xs text-watt-navy/70">Low Risk</span>
              </div>
            </div>

            {/* Peak Hours Breakdown */}
            <div className="p-4 rounded-xl bg-watt-navy text-white">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-watt-bitcoin" />
                <h4 className="font-semibold">Typical Peak Hours</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70">Winter (Nov-Feb)</p>
                  <p className="font-semibold">5:00 PM - 6:00 PM</p>
                  <p className="text-xs text-white/50">Heating + business close</p>
                </div>
                <div>
                  <p className="text-white/70">Summer (Jun-Aug)</p>
                  <p className="font-semibold">3:00 PM - 4:00 PM</p>
                  <p className="text-xs text-white/50">AC peak demand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className={`p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-2xl font-bold text-watt-navy mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            12CP Savings Calculator
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-watt-navy mb-2">
                  Facility Size (MW)
                </label>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={facilityMW}
                  onChange={(e) => setFacilityMW(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-watt-navy/50">10 MW</span>
                  <span className="text-lg font-bold text-watt-navy">{facilityMW} MW</span>
                  <span className="text-watt-navy/50">500 MW</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-watt-navy mb-2">
                  Peaks Avoided (out of 12)
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={avoidedPeaks}
                  onChange={(e) => setAvoidedPeaks(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-watt-navy/50">0</span>
                  <span className="text-lg font-bold text-watt-navy">{avoidedPeaks} / 12 peaks</span>
                  <span className="text-watt-navy/50">12</span>
                </div>
              </div>

              {/* WattByte Reference */}
              <div className="p-4 rounded-xl bg-watt-bitcoin/10 border border-watt-bitcoin/30">
                <p className="text-sm text-watt-navy">
                  <strong>WattByte's 135MW Alberta Heartland:</strong> By avoiding all 12 peaks 
                  (shutting down ~12 hours/year), we can save up to 
                  <span className="font-bold text-watt-bitcoin"> ${(135 * 11.73 * 8760 / 1000000).toFixed(1)}M/year</span> 
                  in transmission costs.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white border border-green-200">
                <p className="text-sm text-watt-navy/70 mb-1">Base Transmission Cost</p>
                <p className="text-2xl font-bold text-watt-navy">
                  ${(baseTransmissionCost / 1000000).toFixed(2)}M <span className="text-sm text-watt-navy/50">CAD/year</span>
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-green-200">
                <p className="text-sm text-watt-navy/70 mb-1">Transmission Reduction</p>
                <p className="text-2xl font-bold text-green-600">
                  {reductionPercent.toFixed(0)}%
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <p className="text-sm text-white/70 mb-1">Annual Savings</p>
                <p className="text-4xl font-bold">
                  ${(annualSavings / 1000000).toFixed(2)}M
                </p>
                <p className="text-sm text-white/80 mt-2">
                  By shutting down for just {avoidedPeaks} hour{avoidedPeaks !== 1 ? 's' : ''}/year
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className={`mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 mb-1">Prediction is Key</p>
            <p className="text-sm text-amber-700">
              The challenge is predicting WHEN peaks will occur. AESO announces peaks retroactively, 
              so advanced forecasting (like WattByte's VoltScout) is essential for successful 12CP avoidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
