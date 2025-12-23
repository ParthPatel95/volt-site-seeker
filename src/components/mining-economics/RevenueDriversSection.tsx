import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, TrendingUp, Clock, Coins, Calculator, Info } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const RevenueDriversSection = () => {
  const [btcPrice, setBtcPrice] = useState(100000);
  const [hashrate, setHashrate] = useState(100);
  const [networkHashrate, setNetworkHashrate] = useState(750);

  // Block reward calculation (simplified)
  const blocksPerDay = 144;
  const blockReward = 3.125; // Post-2024 halving
  const dailyBtcMined = (hashrate / (networkHashrate * 1000)) * blocksPerDay * blockReward;
  const dailyRevenue = dailyBtcMined * btcPrice;
  const hashPrice = (dailyRevenue / hashrate).toFixed(4);

  const halvingHistory = [
    { date: "2009", reward: 50, price: "$0.001", hashrate: "0.001 TH/s" },
    { date: "2012", reward: 25, price: "$12", hashrate: "25 TH/s" },
    { date: "2016", reward: 12.5, price: "$650", hashrate: "2 EH/s" },
    { date: "2020", reward: 6.25, price: "$8,500", hashrate: "120 EH/s" },
    { date: "2024", reward: 3.125, price: "$65,000", hashrate: "600 EH/s" },
    { date: "2028", reward: 1.5625, price: "?", hashrate: "?" },
  ];

  const basicContent = (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-3">What is Mining Revenue?</h4>
        <p className="text-muted-foreground mb-4">
          Mining revenue is the Bitcoin you earn for helping secure the network. Every ~10 minutes, 
          a "block" is mined, and the miner who solves it gets a reward of newly created Bitcoin 
          plus transaction fees.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <Bitcoin className="w-8 h-8 text-watt-bitcoin mx-auto mb-2" />
            <div className="text-2xl font-bold text-watt-bitcoin">3.125 BTC</div>
            <div className="text-sm text-muted-foreground">Current Block Reward</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-watt-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-watt-purple">144</div>
            <div className="text-sm text-muted-foreground">Blocks Per Day</div>
          </div>
        </div>
      </div>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* Revenue Calculator */}
      <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-watt-success" />
          Revenue Calculator
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bitcoin Price (USD)
              </label>
              <input
                type="range"
                min="20000"
                max="200000"
                step="1000"
                value={btcPrice}
                onChange={(e) => setBtcPrice(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>$20K</span>
                <span className="text-watt-bitcoin font-bold">${(btcPrice/1000).toFixed(0)}K</span>
                <span>$200K</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Hashrate (TH/s)
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                value={hashrate}
                onChange={(e) => setHashrate(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>10 TH/s</span>
                <span className="text-watt-purple font-bold">{hashrate} TH/s</span>
                <span>1,000 TH/s</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                Network Hashrate (EH/s)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total mining power competing on the Bitcoin network. Higher = more competition, lower individual earnings.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <input
                type="range"
                min="400"
                max="1500"
                step="10"
                value={networkHashrate}
                onChange={(e) => setNetworkHashrate(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>400 EH/s</span>
                <span className="text-foreground font-bold">{networkHashrate} EH/s</span>
                <span>1,500 EH/s</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-watt-success/10 rounded-xl p-4 text-center">
              <Bitcoin className="w-6 h-6 text-watt-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-watt-success">
                {dailyBtcMined.toFixed(6)}
              </div>
              <div className="text-sm text-muted-foreground">BTC/Day</div>
            </div>
            <div className="bg-watt-bitcoin/10 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
              <div className="text-2xl font-bold text-watt-bitcoin">
                ${dailyRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">USD/Day</div>
            </div>
            <div className="bg-watt-purple/10 rounded-xl p-4 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <Coins className="w-6 h-6 text-watt-purple mx-auto mb-2" />
                    <div className="text-2xl font-bold text-watt-purple">
                      ${hashPrice}
                    </div>
                    <div className="text-sm text-muted-foreground">Hash Price</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Daily revenue per TH/s of mining power. The key metric for comparing mining profitability.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">
                ${(dailyRevenue * 30).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Rev</div>
            </div>
          </div>
        </div>
      </div>

      {/* Halving History */}
      <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-watt-bitcoin" />
          Bitcoin Halving History & Impact
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-semibold">Year</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">Block Reward</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">BTC Price</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">Network Hashrate</th>
              </tr>
            </thead>
            <tbody>
              {halvingHistory.map((era, idx) => (
                <tr key={idx} className={`border-b border-border ${idx === 4 ? 'bg-watt-success/5' : ''}`}>
                  <td className="py-3 px-4 font-bold text-foreground">{era.date}</td>
                  <td className="py-3 px-4 text-watt-bitcoin font-medium">{era.reward} BTC</td>
                  <td className="py-3 px-4 text-foreground">{era.price}</td>
                  <td className="py-3 px-4 text-muted-foreground">{era.hashrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-watt-bitcoin/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-watt-bitcoin">Key Insight:</strong> Each halving reduces 
            block rewards by 50%, but historically BTC price has increased significantly, 
            often offsetting the reward reduction. Network hashrate continues to grow regardless.
          </p>
        </div>
      </div>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}
      
      {/* Expert Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-watt-success/10 to-watt-bitcoin/10 rounded-2xl p-6">
          <h4 className="font-bold text-foreground mb-4">Hash Price Formula</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Hash price represents the daily revenue earned per terahash (TH/s) of mining power. 
            It's the most important metric for comparing mining profitability across different 
            hardware and time periods.
          </p>
          <div className="bg-background/60 rounded-xl p-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Formula</div>
              <div className="font-mono text-sm text-foreground">
                Hash Price = (Block Reward × BTC Price × 144) ÷ Network Hashrate
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-background/40 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Current Example:</strong> At 750 EH/s and $100K BTC, each TH/s earns approximately 
              ${hashPrice}/day before costs.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-watt-purple/10 to-blue-500/10 rounded-2xl p-6">
          <h4 className="font-bold text-foreground mb-4">Transaction Fees Analysis</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Beyond block rewards, miners earn transaction fees. As block rewards decrease 
            through halvings, transaction fees become increasingly important for miner revenue.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Normal periods</span>
              <span className="font-medium text-foreground">2-5% of revenue</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High congestion</span>
              <span className="font-medium text-watt-bitcoin">10-30% of revenue</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ordinals/BRC-20 peaks</span>
              <span className="font-medium text-watt-success">50%+ of revenue</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-background/40 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Long-term view:</strong> By 2140, transaction fees will be 100% of miner revenue 
              as block rewards asymptotically approach zero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="revenue" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Revenue Drivers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Understanding Mining Revenue
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mining revenue is determined by Bitcoin price, network difficulty, 
              block rewards, and your share of the global hashrate.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <ProgressiveDisclosure
            basicContent={basicContent}
            intermediateContent={intermediateContent}
            expertContent={expertContent}
            defaultLevel="intermediate"
            labels={{
              basic: "Simple",
              intermediate: "Calculator",
              expert: "Full Analysis"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default RevenueDriversSection;
