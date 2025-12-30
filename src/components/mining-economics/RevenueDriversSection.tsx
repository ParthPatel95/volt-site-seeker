import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, TrendingUp, Clock, Coins, Calculator, Info, DollarSign, Activity } from 'lucide-react';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECStatCard, MECKeyInsight, MECDeepDive, MECCallout } from './shared';
import { motion } from 'framer-motion';

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
    { date: "2009", reward: 50, price: "$0.001", hashrate: "0.001 TH/s", priceMultiple: "—" },
    { date: "2012", reward: 25, price: "$12", hashrate: "25 TH/s", priceMultiple: "12,000x" },
    { date: "2016", reward: 12.5, price: "$650", hashrate: "2 EH/s", priceMultiple: "54x" },
    { date: "2020", reward: 6.25, price: "$8,500", hashrate: "120 EH/s", priceMultiple: "13x" },
    { date: "2024", reward: 3.125, price: "$65,000", hashrate: "600 EH/s", priceMultiple: "7.6x" },
    { date: "2028", reward: 1.5625, price: "?", hashrate: "?", priceMultiple: "?" },
  ];

  const basicContent = (
    <div className="space-y-6">
      <MECContentCard variant="default">
        <h4 className="font-bold text-foreground mb-3 text-lg">What is Mining Revenue?</h4>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Mining revenue is the Bitcoin you earn for helping secure the network. Every ~10 minutes, 
          a "block" is mined, and the miner who solves it gets a reward of newly created Bitcoin 
          plus transaction fees. Your share depends on your percentage of the global hashrate.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <MECStatCard
            icon={Bitcoin}
            value="3.125 BTC"
            label="Current Block Reward"
            color="bitcoin"
          />
          <MECStatCard
            icon={Clock}
            value="144"
            label="Blocks Per Day"
            color="purple"
          />
        </div>
      </MECContentCard>

      <MECKeyInsight variant="info" title="Why This Matters">
        Understanding revenue drivers helps you predict income and plan for changes like halvings. 
        A miner who doesn't understand these fundamentals is flying blind.
      </MECKeyInsight>
    </div>
  );

  const intermediateContent = (
    <div className="space-y-6">
      {/* Revenue Calculator */}
      <MECContentCard variant="elevated" headerIcon={Calculator} headerTitle="Revenue Calculator" headerIconColor="success">
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>$20K</span>
                <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>${(btcPrice/1000).toFixed(0)}K</span>
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-purple))]"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>10 TH/s</span>
                <span className="font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>{hashrate} TH/s</span>
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
            <MECStatCard
              icon={Bitcoin}
              value={dailyBtcMined.toFixed(6)}
              label="BTC/Day"
              color="success"
            />
            <MECStatCard
              icon={TrendingUp}
              value={`$${dailyRevenue.toFixed(2)}`}
              label="USD/Day"
              color="bitcoin"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <MECStatCard
                    icon={Coins}
                    value={`$${hashPrice}`}
                    label="Hash Price"
                    color="purple"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Daily revenue per TH/s of mining power. The key metric for comparing mining profitability.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <MECStatCard
              icon={Clock}
              value={`$${(dailyRevenue * 30).toFixed(0)}`}
              label="Monthly Rev"
              color="blue"
            />
          </div>
        </div>
      </MECContentCard>

      {/* Deep Dive: Hash Price */}
      <MECDeepDive title="Understanding Hash Price in Detail" icon={Activity}>
        <div className="space-y-4">
          <p>
            <strong>Hash Price</strong> is the most important metric for miners. It represents 
            how much revenue you earn per unit of hashrate (TH/s) per day. When hash price is 
            high, mining is more profitable. When it's low, only the most efficient operations survive.
          </p>
          <MECCallout variant="formula" title="Hash Price Formula">
            Hash Price = (Block Reward × BTC Price × Blocks/Day) ÷ Network Hashrate
          </MECCallout>
          <p>
            Hash price is affected by three factors: <strong>BTC price</strong> (higher = better), 
            <strong>block reward</strong> (halves every 4 years), and <strong>network hashrate</strong> 
            (more competition = lower hash price). Track hash price at hashrateindex.com.
          </p>
        </div>
      </MECDeepDive>

      {/* Halving History */}
      <MECContentCard variant="elevated" headerIcon={Clock} headerTitle="Bitcoin Halving History & Impact" headerIconColor="bitcoin">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-semibold">Year</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">Block Reward</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">BTC Price</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold">Network Hashrate</th>
                <th className="text-left py-3 px-4 text-foreground font-semibold hidden md:table-cell">Price Multiple</th>
              </tr>
            </thead>
            <tbody>
              {halvingHistory.map((era, idx) => (
                <tr key={idx} className={`border-b border-border ${idx === 4 ? 'bg-[hsl(var(--watt-success)/0.05)]' : ''}`}>
                  <td className="py-3 px-4 font-bold text-foreground">{era.date}</td>
                  <td className="py-3 px-4 font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{era.reward} BTC</td>
                  <td className="py-3 px-4 text-foreground">{era.price}</td>
                  <td className="py-3 px-4 text-muted-foreground">{era.hashrate}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{era.priceMultiple}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <MECKeyInsight variant="warning" className="mt-6" title="Halving Reality Check">
          Each halving reduces block rewards by 50%, but historically BTC price has increased significantly, 
          often offsetting the reward reduction. <strong>However, this is not guaranteed.</strong> Plan 
          conservatively by assuming difficulty continues to rise without proportional price increases.
        </MECKeyInsight>
      </MECContentCard>
    </div>
  );

  const expertContent = (
    <div className="space-y-6">
      {intermediateContent}
      
      {/* Expert Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--watt-success) / 0.1), hsl(var(--watt-bitcoin) / 0.1))' 
          }}
        >
          <h4 className="font-bold text-foreground mb-4">Hash Price Deep Analysis</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Hash price represents the daily revenue earned per terahash (TH/s) of mining power. 
            It's the most important metric for comparing mining profitability across different 
            hardware and time periods.
          </p>
          <MECCallout variant="formula" title="Current Example">
            At {networkHashrate} EH/s and ${btcPrice.toLocaleString()} BTC, each TH/s earns approximately ${hashPrice}/day before costs.
          </MECCallout>
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Historical context:</strong> Hash price was over $0.40 in early 2021 during the bull run. 
            Today's compressed hash prices require efficient operations.
          </p>
        </div>

        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--watt-purple) / 0.1), rgba(59, 130, 246, 0.1))' 
          }}
        >
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
              <span className="font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>10-30% of revenue</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ordinals/BRC-20 peaks</span>
              <span className="font-medium" style={{ color: 'hsl(var(--watt-success))' }}>50%+ of revenue</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <strong>Long-term view:</strong> By 2140, transaction fees will be 100% of miner revenue 
            as block rewards asymptotically approach zero.
          </p>
        </div>
      </div>

      {/* Key Takeaways */}
      <MECKeyInsight variant="success" title="Section Summary">
        <ul className="space-y-2 mt-2">
          <li>• <strong>Hash price</strong> is your key profitability metric — track it daily</li>
          <li>• <strong>Network hashrate</strong> grows 40-90% annually, compressing revenues</li>
          <li>• <strong>Halvings</strong> cut rewards but historically prices have risen to compensate</li>
          <li>• <strong>Transaction fees</strong> will become increasingly important over time</li>
        </ul>
      </MECKeyInsight>
    </div>
  );

  return (
    <MECSectionWrapper id="revenue-drivers" theme="gradient">
      <ScrollReveal>
        <MECSectionHeader
          badge="Revenue Drivers"
          badgeIcon={DollarSign}
          title="Understanding Mining Revenue"
          description="Mining revenue is determined by Bitcoin price, network difficulty, block rewards, and your share of the global hashrate. Master these variables to predict your income."
          accentColor="success"
        />
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
    </MECSectionWrapper>
  );
};

export default RevenueDriversSection;
