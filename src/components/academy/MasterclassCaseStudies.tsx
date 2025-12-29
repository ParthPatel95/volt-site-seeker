import CaseStudy from './CaseStudy';
import { DollarSign, TrendingDown, Zap, AlertTriangle, Building2, Globe } from 'lucide-react';

// Case Study: CleanSpark Bear Market Survival
export const CleanSparkSurvivalCase = () => (
  <CaseStudy
    title="CleanSpark: Thriving Through the 2022 Bear Market"
    location="Georgia & Texas, USA"
    date="2022-2023"
    capacity="16 EH/s (as of 2024)"
    metrics={[
      { label: 'Growth During Bear', value: '10x', icon: <TrendingDown className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Avg. Power Cost', value: '$0.035/kWh', icon: <Zap className="w-4 h-4 text-yellow-500 mx-auto" /> },
      { label: 'Efficiency', value: '24 J/TH', icon: <DollarSign className="w-4 h-4 text-primary mx-auto" /> },
      { label: 'Market Cap Growth', value: '15x', icon: <TrendingDown className="w-4 h-4 text-green-500 mx-auto" /> },
    ]}
    whatWorked={[
      'Maintained conservative debt levels (0.3x debt-to-equity) entering 2022',
      'Acquired distressed assets at 30-50% discounts during market downturn',
      'Secured long-term fixed-price power contracts before energy price spikes',
      'Kept disciplined focus on efficiency metrics over raw hashrate growth',
      'Built strong utility relationships enabling rapid site acquisitions',
    ]}
    lessonsLearned={[
      'Bear markets are the best time to acquire assets and expand capacity',
      'Conservative capital structure provides strategic flexibility when competitors struggle',
      'Fixed-price power contracts are worth paying a premium for during uncertain times',
      'Efficiency focus compounds—every J/TH saved multiplies across the fleet',
    ]}
    proTip="The companies that survive bear markets are those that prepared during bull markets. CleanSpark's conservative financing and fixed power costs were decisions made in 2021 that paid off in 2022."
    sourceUrl="https://www.cleanspark.com/investor-relations"
    sourceName="CleanSpark Investor Relations"
  />
);

// Case Study: Compute North Bankruptcy
export const ComputeNorthBankruptcyCase = () => (
  <CaseStudy
    title="Compute North Collapse: Anatomy of a Failure"
    location="Texas & South Dakota, USA"
    date="September 2022"
    capacity="200+ MW (planned)"
    metrics={[
      { label: 'Liabilities', value: '$500M+', icon: <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" /> },
      { label: 'Creditors', value: '200+', icon: <Building2 className="w-4 h-4 text-muted-foreground mx-auto" /> },
      { label: 'Time to Collapse', value: '8 months', icon: <TrendingDown className="w-4 h-4 text-red-500 mx-auto" /> },
      { label: 'Recovery Rate', value: '~10-15%', icon: <DollarSign className="w-4 h-4 text-red-500 mx-auto" /> },
    ]}
    whatWorked={[
      'Initial rapid scaling attracted significant institutional investment',
      'Secured favorable site locations with grid access',
      'Built relationships with major mining clients (Marathon, etc.)',
    ]}
    lessonsLearned={[
      'Aggressive expansion funded entirely by debt creates existential risk during downturns',
      'Hosting model revenue depends on clients who may default when BTC crashes',
      'Construction cost overruns can spiral quickly without proper project management',
      'Counterparty risk in power contracts can be fatal if not properly hedged',
      'Customer prepayments create liability—ensure they are earned, not just collected',
    ]}
    proTip="Compute North's failure was a leverage problem, not a business model problem. They took on $500M in obligations while having minimal equity buffer, leaving zero margin for market volatility."
    sourceUrl="https://www.coindesk.com/business/2022/09/22/bitcoin-mining-giant-compute-north-files-for-bankruptcy/"
    sourceName="CoinDesk"
  />
);

// Case Study: Core Scientific Restructuring
export const CoreScientificRestructuringCase = () => (
  <CaseStudy
    title="Core Scientific: Chapter 11 Restructuring & Emergence"
    location="Multiple US Sites"
    date="December 2022 - January 2024"
    capacity="20+ EH/s"
    metrics={[
      { label: 'Pre-Bankruptcy Debt', value: '$1.3B', icon: <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" /> },
      { label: 'Post-Emergence Debt', value: '$400M', icon: <TrendingDown className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Debt Reduction', value: '70%', icon: <DollarSign className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Operations Uptime', value: '95%+', icon: <Zap className="w-4 h-4 text-yellow-500 mx-auto" /> },
    ]}
    whatWorked={[
      'Filed Chapter 11 proactively before running out of cash',
      'Maintained operations throughout bankruptcy process',
      'Retained key technical and operational staff',
      'Negotiated debt-for-equity conversion preserving value',
      'Emerged with clean balance sheet and diversified AI/HPC strategy',
    ]}
    lessonsLearned={[
      'Chapter 11 is a tool, not a death sentence—proper use can save the business',
      'Maintaining operations during restructuring is critical for preserving value',
      'Convertible debt structures can become problematic when stock prices collapse',
      'Hosting customer exposure to single counterparty creates concentration risk',
      'Diversification into AI/HPC hosting provides revenue stability beyond mining',
    ]}
    proTip="Core Scientific's successful emergence demonstrates that the assets themselves (power contracts, infrastructure, expertise) retain significant value even when the capital structure fails. The lesson: focus on building valuable assets, structure capital conservatively."
    sourceUrl="https://corescientific.com/investors"
    sourceName="Core Scientific"
  />
);

// Case Study: Marathon Digital Growth
export const MarathonGrowthCase = () => (
  <CaseStudy
    title="Marathon Digital: From 100 MW to 1 GW+"
    location="Texas, North Dakota, UAE, Paraguay"
    date="2021-2024"
    capacity="1+ GW operational"
    metrics={[
      { label: 'Hashrate Growth', value: '30x', icon: <TrendingDown className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Global Sites', value: '10+', icon: <Globe className="w-4 h-4 text-primary mx-auto" /> },
      { label: 'BTC Held', value: '17,000+', icon: <DollarSign className="w-4 h-4 text-yellow-500 mx-auto" /> },
      { label: 'Market Cap', value: '$5B+', icon: <Building2 className="w-4 h-4 text-green-500 mx-auto" /> },
    ]}
    whatWorked={[
      'Geographic diversification across jurisdictions reduced regulatory risk',
      'Mixed ownership model: self-hosted + hosted provides flexibility',
      'HODL treasury strategy captured BTC appreciation',
      'Public company status enabled capital raising at scale',
      'Strategic timing of fleet upgrades before halvings',
    ]}
    lessonsLearned={[
      'Scale requires capital access—public markets provide this at lower cost',
      'Geographic diversification is insurance against regulatory risk',
      'HODL strategy works in bull markets but requires liquidity management',
      'International expansion adds complexity but reduces concentration risk',
      'Fleet refresh timing is critical—buy new ASICs before halvings, not after',
    ]}
    proTip="Marathon's success came from thinking like an institution, not a startup. They raised capital during bull markets, deployed conservatively, and diversified globally—the opposite of the 'move fast and break things' approach that sank competitors."
    sourceUrl="https://ir.mara.com/"
    sourceName="Marathon Digital Holdings"
  />
);

// Case Study: Bitfarms Quebec Operations
export const BitfarmsQuebecCase = () => (
  <CaseStudy
    title="Bitfarms: Quebec Hydro Power Advantage"
    location="Quebec, Canada"
    date="2017-Present"
    capacity="7+ EH/s"
    metrics={[
      { label: 'Power Cost', value: '$0.02/kWh', icon: <Zap className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Renewable %', value: '99%', icon: <Globe className="w-4 h-4 text-green-500 mx-auto" /> },
      { label: 'Sites', value: '11', icon: <Building2 className="w-4 h-4 text-primary mx-auto" /> },
      { label: 'Break-Even BTC', value: '<$15K', icon: <DollarSign className="w-4 h-4 text-green-500 mx-auto" /> },
    ]}
    whatWorked={[
      'First-mover advantage in Quebec secured ultra-low hydro power rates',
      'Built strong relationships with Hydro-Québec over multiple years',
      'Achieved near-100% renewable energy for ESG positioning',
      'Maintained lowest break-even BTC price in public miner universe',
      'Used Canadian cost advantage to fund international expansion',
    ]}
    lessonsLearned={[
      'First-mover advantage in power markets can create lasting moats',
      'Regulatory relationships take years to build but provide stability',
      'Quebec moratorium on new mining shows even favorable jurisdictions can change',
      'ESG narrative (99% renewable) attracts institutional capital',
      'Use home market advantage to fund diversification elsewhere',
    ]}
    proTip="Bitfarms' $0.02/kWh power cost is their moat. They survived the 2022 crash when others failed because their break-even was so low. The lesson: sustainable competitive advantage comes from power cost, not hashrate."
    sourceUrl="https://bitfarms.com/investors/"
    sourceName="Bitfarms"
  />
);

// Case Study: Halving Preparation
export const HalvingPreparationCase = () => (
  <CaseStudy
    title="April 2024 Halving: Winners & Losers"
    location="Global"
    date="April 2024"
    capacity="600+ EH/s Network"
    metrics={[
      { label: 'Block Reward', value: '6.25→3.125', icon: <TrendingDown className="w-4 h-4 text-amber-500 mx-auto" /> },
      { label: 'Hash Price Drop', value: '-50%', icon: <DollarSign className="w-4 h-4 text-red-500 mx-auto" /> },
      { label: 'Miner Exits', value: '~15%', icon: <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" /> },
      { label: 'Efficiency Threshold', value: '25 J/TH', icon: <Zap className="w-4 h-4 text-yellow-500 mx-auto" /> },
    ]}
    whatWorked={[
      'Operators who upgraded to S21/S21 Pro pre-halving maintained profitability',
      'Those with sub-$0.04/kWh power remained cash-flow positive',
      'Demand response enrollment provided revenue buffer during hash price crash',
      'Conservative leverage allowed time to adjust without forced selling',
      'Diversified revenue (hosting, AI/HPC) offset mining revenue decline',
    ]}
    lessonsLearned={[
      'Fleet efficiency upgrades must happen 6-12 months BEFORE halving, not after',
      'Hash price drops 50% instantly—your costs must already be optimized',
      'Older equipment (S19, M30) becomes unprofitable overnight at high power costs',
      'The halving is predictable—there is no excuse for being unprepared',
      'Post-halving period is optimal for acquiring distressed assets from unprepared operators',
    ]}
    proTip="The 2024 halving separated prepared operators from speculators. Those with efficient fleets and low power costs actually increased market share as competitors shut down. The halving is not a crisis—it's a planned competitive event that rewards preparation."
    sourceUrl="https://hashrateindex.com/"
    sourceName="Hashrate Index"
  />
);
