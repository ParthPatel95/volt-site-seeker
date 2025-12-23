import { useState } from 'react';
import { Calculator, Zap, MapPin, DollarSign, AlertTriangle } from 'lucide-react';

const InterconnectionCostCalculator = () => {
  const [inputs, setInputs] = useState({
    distanceToSubstation: 2,
    voltageLevel: '138kV',
    requiredMW: 50,
    upgradeNeeded: 'none'
  });

  const voltageMultipliers: Record<string, number> = {
    '25kV': 0.6,
    '69kV': 0.8,
    '138kV': 1.0,
    '230kV': 1.4,
    '500kV': 2.0
  };

  const upgradeMultipliers: Record<string, number> = {
    'none': 0,
    'minor': 2000000,
    'moderate': 8000000,
    'major': 20000000
  };

  const calculateCosts = () => {
    const baseLineRate = 1500000; // $1.5M per mile
    const voltageMultiplier = voltageMultipliers[inputs.voltageLevel];
    
    const transmissionLine = inputs.distanceToSubstation * baseLineRate * voltageMultiplier;
    const substationTap = 750000 + (inputs.requiredMW * 5000);
    const customerSubstation = 2000000 + (inputs.requiredMW * 50000);
    const engineeringStudies = 75000 + (inputs.requiredMW * 1000);
    const utilityUpgrades = upgradeMultipliers[inputs.upgradeNeeded];
    const permitting = 50000 + (inputs.distanceToSubstation * 10000);

    const total = transmissionLine + substationTap + customerSubstation + 
                  engineeringStudies + utilityUpgrades + permitting;

    return {
      transmissionLine,
      substationTap,
      customerSubstation,
      engineeringStudies,
      utilityUpgrades,
      permitting,
      total
    };
  };

  const costs = calculateCosts();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const costBreakdown = [
    { label: 'Transmission Line', value: costs.transmissionLine, icon: MapPin, note: `${inputs.distanceToSubstation} mi @ ${inputs.voltageLevel}` },
    { label: 'Substation Tap', value: costs.substationTap, icon: Zap, note: 'Utility connection point' },
    { label: 'Customer Substation', value: costs.customerSubstation, icon: Zap, note: 'Transformers, switchgear, protection' },
    { label: 'Engineering Studies', value: costs.engineeringStudies, icon: Calculator, note: 'System impact, facilities study' },
    { label: 'Utility Upgrades', value: costs.utilityUpgrades, icon: AlertTriangle, note: inputs.upgradeNeeded === 'none' ? 'None required' : `${inputs.upgradeNeeded.charAt(0).toUpperCase() + inputs.upgradeNeeded.slice(1)} upgrades` },
    { label: 'Permitting', value: costs.permitting, icon: DollarSign, note: 'Environmental, local approvals' }
  ];

  return (
    <div className="bg-watt-navy rounded-2xl p-8 text-white">
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Calculator className="w-5 h-5 text-watt-bitcoin" />
        Interconnection Cost Calculator
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-white/70 mb-2">Distance to Substation (miles)</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={inputs.distanceToSubstation}
              onChange={(e) => setInputs(p => ({ ...p, distanceToSubstation: Number(e.target.value) }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-white/50 mt-1">
              <span>0.5 mi</span>
              <span className="text-watt-bitcoin font-bold">{inputs.distanceToSubstation} miles</span>
              <span>10 mi</span>
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-2">Voltage Level</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(voltageMultipliers).map((voltage) => (
                <button
                  key={voltage}
                  onClick={() => setInputs(p => ({ ...p, voltageLevel: voltage }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputs.voltageLevel === voltage
                      ? 'bg-watt-purple text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {voltage}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-2">Required Capacity (MW)</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={inputs.requiredMW}
              onChange={(e) => setInputs(p => ({ ...p, requiredMW: Number(e.target.value) }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-white/50 mt-1">
              <span>10 MW</span>
              <span className="text-watt-bitcoin font-bold">{inputs.requiredMW} MW</span>
              <span>200 MW</span>
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-2">Utility Upgrade Requirements</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'none', label: 'None', desc: 'Existing capacity' },
                { key: 'minor', label: 'Minor', desc: '+$2M' },
                { key: 'moderate', label: 'Moderate', desc: '+$8M' },
                { key: 'major', label: 'Major', desc: '+$20M' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setInputs(p => ({ ...p, upgradeNeeded: option.key }))}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    inputs.upgradeNeeded === option.key
                      ? 'bg-watt-purple text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-70">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <div className="space-y-3 mb-6">
            {costBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-white/50" />
                  <div>
                    <div className="text-sm text-white/90">{item.label}</div>
                    <div className="text-xs text-white/50">{item.note}</div>
                  </div>
                </div>
                <span className={`font-bold ${item.value === 0 ? 'text-white/50' : 'text-watt-bitcoin'}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-watt-success/20 rounded-xl text-center">
            <div className="text-sm text-white/70 mb-1">Estimated Total Cost</div>
            <div className="text-3xl font-bold text-watt-success">{formatCurrency(costs.total)}</div>
            <div className="text-xs text-white/50 mt-2">
              {inputs.requiredMW} MW @ {inputs.distanceToSubstation} miles
            </div>
          </div>

          <div className="mt-4 p-3 bg-watt-bitcoin/20 rounded-lg">
            <p className="text-xs text-white/70">
              <strong className="text-watt-bitcoin">⚠️ Note:</strong> Actual costs vary significantly based on 
              terrain, existing infrastructure, and utility-specific requirements. Get formal estimates from utilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterconnectionCostCalculator;
