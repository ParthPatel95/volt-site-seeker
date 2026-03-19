export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSet {
  sectionId: string;
  title: string;
  questions: QuizQuestion[];
}

// Bitcoin 101 Quiz Data
export const BITCOIN_QUIZZES: QuizSet[] = [
  {
    sectionId: 'what-is-bitcoin',
    title: 'What is Bitcoin?',
    questions: [
      {
        id: 'btc-1-1',
        question: 'What is the maximum supply of Bitcoin that will ever exist?',
        options: ['10 million', '21 million', '100 million', 'Unlimited'],
        correctIndex: 1,
        explanation: 'Bitcoin has a fixed supply cap of 21 million coins, making it a deflationary asset with built-in scarcity.',
      },
      {
        id: 'btc-1-2',
        question: 'Who created Bitcoin?',
        options: ['Elon Musk', 'Satoshi Nakamoto', 'Vitalik Buterin', 'The Federal Reserve'],
        correctIndex: 1,
        explanation: 'Bitcoin was created by the pseudonymous Satoshi Nakamoto, whose true identity remains unknown.',
      },
      {
        id: 'btc-1-3',
        question: 'What type of currency is Bitcoin?',
        options: ['Government-issued currency', 'Decentralized digital currency', 'Bank-controlled currency', 'Corporate currency'],
        correctIndex: 1,
        explanation: 'Bitcoin is a decentralized digital currency that operates without central banks or single administrators.',
      },
    ],
  },
  {
    sectionId: 'how-it-works',
    title: 'How Bitcoin Works',
    questions: [
      {
        id: 'btc-2-1',
        question: 'What technology underlies Bitcoin?',
        options: ['Cloud computing', 'Blockchain', 'Artificial Intelligence', 'Quantum computing'],
        correctIndex: 1,
        explanation: 'Bitcoin uses blockchain technology - a distributed ledger that records all transactions across a network of computers.',
      },
      {
        id: 'btc-2-2',
        question: 'How are Bitcoin transactions verified?',
        options: ['By banks', 'By government agencies', 'By network nodes through consensus', 'By a single central server'],
        correctIndex: 2,
        explanation: 'Bitcoin transactions are verified by network nodes through cryptographic consensus, with no central authority needed.',
      },
      {
        id: 'btc-2-3',
        question: 'What is a "block" in Bitcoin?',
        options: ['A physical storage device', 'A group of transactions bundled together', 'A type of wallet', 'A mining machine'],
        correctIndex: 1,
        explanation: 'A block is a collection of Bitcoin transactions that are bundled together and added to the blockchain approximately every 10 minutes.',
      },
    ],
  },
  {
    sectionId: 'mining',
    title: 'Bitcoin Mining',
    questions: [
      {
        id: 'btc-3-1',
        question: 'What consensus mechanism does Bitcoin use?',
        options: ['Proof of Stake', 'Proof of Work', 'Proof of Authority', 'Delegated Proof of Stake'],
        correctIndex: 1,
        explanation: 'Bitcoin uses Proof of Work (PoW), where miners compete to solve complex mathematical puzzles to validate transactions.',
      },
      {
        id: 'btc-3-2',
        question: 'Approximately how often is a new Bitcoin block mined?',
        options: ['Every second', 'Every minute', 'Every 10 minutes', 'Every hour'],
        correctIndex: 2,
        explanation: 'The Bitcoin network adjusts difficulty to target a new block every 10 minutes on average.',
      },
      {
        id: 'btc-3-3',
        question: 'What is the primary purpose of Bitcoin mining?',
        options: ['To create new bitcoins only', 'To secure the network and validate transactions', 'To increase electricity usage', 'To compete with banks'],
        correctIndex: 1,
        explanation: 'Mining secures the Bitcoin network by validating transactions and adding them to the blockchain. New bitcoins are a reward for this work.',
      },
    ],
  },
  {
    sectionId: 'economics',
    title: 'Bitcoin Economics',
    questions: [
      {
        id: 'btc-4-1',
        question: 'What is the "halving" in Bitcoin?',
        options: ['Splitting Bitcoin in half', 'Reducing block rewards by 50% every ~4 years', 'Cutting transaction fees in half', 'A security vulnerability'],
        correctIndex: 1,
        explanation: 'The halving is a programmed event that reduces mining rewards by 50% approximately every 4 years, controlling supply and inflation.',
      },
      {
        id: 'btc-4-2',
        question: 'What is the smallest unit of Bitcoin called?',
        options: ['A bit', 'A satoshi', 'A wei', 'A cent'],
        correctIndex: 1,
        explanation: 'A satoshi (sat) is the smallest unit of Bitcoin, equal to 0.00000001 BTC, named after Bitcoin\'s creator.',
      },
      {
        id: 'btc-4-3',
        question: 'When will all 21 million Bitcoin be mined?',
        options: ['2030', '2050', 'Around 2140', 'They already have been'],
        correctIndex: 2,
        explanation: 'Due to the halving schedule, the last Bitcoin is expected to be mined around the year 2140.',
      },
    ],
  },
  {
    sectionId: 'cryptography',
    title: 'Cryptography Deep Dive',
    questions: [
      {
        id: 'crypto-1',
        question: 'What elliptic curve does Bitcoin use for digital signatures?',
        options: ['secp256r1', 'secp256k1', 'ed25519', 'P-256'],
        correctIndex: 1,
        explanation: 'Bitcoin uses the secp256k1 curve, chosen for its efficiency and non-standard construction that reduces backdoor concerns.',
      },
      {
        id: 'crypto-2',
        question: 'How many bits is a SHA-256 hash output?',
        options: ['128 bits', '256 bits', '512 bits', '1024 bits'],
        correctIndex: 1,
        explanation: 'SHA-256 produces a fixed 256-bit (32-byte) output regardless of input size.',
      },
      {
        id: 'crypto-3',
        question: 'Which signature scheme was added with the Taproot upgrade?',
        options: ['ECDSA', 'Schnorr', 'RSA', 'EdDSA'],
        correctIndex: 1,
        explanation: 'Taproot (November 2021) introduced Schnorr signatures, enabling key aggregation and improved privacy.',
      },
      {
        id: 'crypto-4',
        question: 'What is the purpose of RIPEMD-160 in Bitcoin address generation?',
        options: ['Encrypt the private key', 'Shorten the public key hash', 'Sign transactions', 'Generate random numbers'],
        correctIndex: 1,
        explanation: 'RIPEMD-160 creates a shorter 160-bit hash of the SHA-256 public key hash, making addresses more compact.',
      },
    ],
  },
  {
    sectionId: 'consensus',
    title: 'Consensus & Game Theory',
    questions: [
      {
        id: 'consensus-1',
        question: 'What percentage of hashpower is typically needed for a profitable selfish mining attack?',
        options: ['10%', '25%', '33%', '51%'],
        correctIndex: 2,
        explanation: 'Research shows selfish mining becomes marginally profitable above ~33% hashpower.',
      },
      {
        id: 'consensus-2',
        question: 'How many confirmations are recommended for large transactions?',
        options: ['1', '3', '6', '12'],
        correctIndex: 2,
        explanation: 'Six confirmations (~1 hour) is the industry standard for irreversibility of large transactions.',
      },
      {
        id: 'consensus-3',
        question: 'What is the Nash Equilibrium strategy for rational Bitcoin miners?',
        options: ['Selfish mining', 'Honest mining', 'Empty block mining', 'Transaction censoring'],
        correctIndex: 1,
        explanation: 'Honest mining is the Nash Equilibrium - no miner can improve their outcome by unilaterally deviating from protocol rules.',
      },
    ],
  },
  {
    sectionId: 'wallets',
    title: 'Bitcoin Wallets',
    questions: [
      {
        id: 'btc-5-1',
        question: 'What does a Bitcoin wallet actually store?',
        options: ['Physical bitcoins', 'Private keys to access your Bitcoin', 'A copy of the blockchain', 'Mining software'],
        correctIndex: 1,
        explanation: 'A Bitcoin wallet stores your private keys, which are needed to sign transactions and prove ownership of your Bitcoin.',
      },
      {
        id: 'btc-5-2',
        question: 'What is a "cold wallet"?',
        options: ['A wallet stored in a refrigerator', 'An offline wallet not connected to the internet', 'A wallet with no Bitcoin', 'A temporary wallet'],
        correctIndex: 1,
        explanation: 'A cold wallet is stored offline, making it much more secure against hacking and online threats.',
      },
      {
        id: 'btc-5-3',
        question: 'What happens if you lose your private key?',
        options: ['You can recover it from the bank', 'Your Bitcoin is lost forever', 'Bitcoin support will help you', 'Nothing, you can create a new one'],
        correctIndex: 1,
        explanation: 'Losing your private key means losing access to your Bitcoin permanently. There is no recovery mechanism or central authority to help.',
      },
    ],
  },
];

// AESO 101 Quiz Data
export const AESO_QUIZZES: QuizSet[] = [
  {
    sectionId: 'what-is-aeso',
    title: 'What is AESO?',
    questions: [
      {
        id: 'aeso-1-1',
        question: 'What does AESO stand for?',
        options: ['Alberta Energy Supply Organization', 'Alberta Electric System Operator', 'Alberta Energy System Office', 'Alberta Electrical Standards Organization'],
        correctIndex: 1,
        explanation: 'AESO stands for Alberta Electric System Operator, which manages Alberta\'s electricity grid and wholesale market.',
      },
      {
        id: 'aeso-1-2',
        question: 'What is AESO\'s primary role?',
        options: ['Generate electricity', 'Operate the provincial power grid and wholesale market', 'Set retail electricity prices', 'Build power plants'],
        correctIndex: 1,
        explanation: 'AESO operates Alberta\'s interconnected power system and administers the wholesale electricity market.',
      },
      {
        id: 'aeso-1-3',
        question: 'Is Alberta\'s electricity market regulated or deregulated?',
        options: ['Fully regulated', 'Deregulated wholesale market', 'Government-controlled', 'Privately monopolized'],
        correctIndex: 1,
        explanation: 'Alberta has a deregulated wholesale electricity market where prices are set by supply and demand, not government regulation.',
      },
    ],
  },
  {
    sectionId: 'market-participants',
    title: 'Market Participants',
    questions: [
      {
        id: 'aeso-mp-1',
        question: 'What is a "load" in electricity market terminology?',
        options: ['A power plant', 'An electricity consumer/demand', 'A transmission line', 'A government regulator'],
        correctIndex: 1,
        explanation: 'In electricity markets, "load" refers to electricity demand or consumers who use power from the grid.',
      },
      {
        id: 'aeso-mp-2',
        question: 'Which entity is responsible for scheduling generation in Alberta?',
        options: ['Individual generators', 'AESO', 'The Alberta government', 'Retail electricity providers'],
        correctIndex: 1,
        explanation: 'AESO dispatches generators based on their offers and system needs to balance supply and demand in real-time.',
      },
      {
        id: 'aeso-mp-3',
        question: 'What type of participant can both generate and consume electricity?',
        options: ['Prosumer', 'Aggregator', 'Industrial system designee', 'Transmission owner'],
        correctIndex: 0,
        explanation: 'Prosumers both produce and consume electricity, such as facilities with on-site solar generation.',
      },
    ],
  },
  {
    sectionId: 'pool-pricing',
    title: 'Pool Pricing',
    questions: [
      {
        id: 'aeso-2-1',
        question: 'How often is the pool price calculated in Alberta?',
        options: ['Once per day', 'Every hour', 'Every minute', 'Every second'],
        correctIndex: 1,
        explanation: 'The Alberta pool price is calculated hourly based on the marginal cost of the last generator needed to meet demand.',
      },
      {
        id: 'aeso-2-2',
        question: 'What determines the pool price?',
        options: ['Government regulators', 'The highest bid accepted to meet demand', 'Average of all bids', 'Fixed annual rates'],
        correctIndex: 1,
        explanation: 'The pool price is set by the marginal generator - the last (most expensive) generator needed to satisfy electricity demand.',
      },
      {
        id: 'aeso-2-3',
        question: 'What is the maximum pool price cap in Alberta?',
        options: ['$100/MWh', '$500/MWh', '$1,000/MWh', '$999.99/MWh'],
        correctIndex: 2,
        explanation: 'Alberta\'s pool price has a cap of $1,000/MWh to prevent extreme price spikes during supply shortages.',
      },
      {
        id: 'aeso-2-4',
        question: 'What happens when pool prices go negative?',
        options: ['Trading stops', 'Consumers get paid to use electricity', 'All generators shut down', 'Prices reset to zero'],
        correctIndex: 1,
        explanation: 'Negative prices mean there is oversupply - generators pay consumers to take electricity, often during high wind output.',
      },
    ],
  },
  {
    sectionId: 'price-trends',
    title: 'Price Trends',
    questions: [
      {
        id: 'aeso-pt-1',
        question: 'When do pool prices typically spike in Alberta?',
        options: ['Mild spring days', 'Extreme cold (-30°C) or hot (+30°C) weather', 'Weekends', 'Late night hours'],
        correctIndex: 1,
        explanation: 'Extreme temperatures drive high heating or cooling demand, pushing prices up as expensive peaking generators are needed.',
      },
      {
        id: 'aeso-pt-2',
        question: 'What is the primary driver of price volatility in Alberta?',
        options: ['Government policy', 'Supply-demand balance and weather', 'Time of day only', 'Transmission constraints only'],
        correctIndex: 1,
        explanation: 'Price volatility is driven by the real-time balance of supply and demand, heavily influenced by weather affecting both.',
      },
      {
        id: 'aeso-pt-3',
        question: 'Which generation source contributes most to negative price periods?',
        options: ['Natural gas', 'Coal', 'Wind', 'Hydro'],
        correctIndex: 2,
        explanation: 'Wind generation with near-zero marginal cost can create oversupply conditions, especially at night when demand is low.',
      },
    ],
  },
  {
    sectionId: 'twelve-cp',
    title: '12CP Transmission',
    questions: [
      {
        id: 'aeso-3-1',
        question: 'What does 12CP stand for?',
        options: ['12 Charging Points', '12 Coincident Peaks', '12 Consumer Prices', '12 Capacity Payments'],
        correctIndex: 1,
        explanation: '12CP refers to the 12 Coincident Peaks - the highest demand hours each month that determine transmission cost allocation.',
      },
      {
        id: 'aeso-3-2',
        question: 'Why do large consumers try to reduce usage during 12CP periods?',
        options: ['To help the environment', 'To reduce their share of transmission costs', 'Because power is unavailable', 'Government mandate'],
        correctIndex: 1,
        explanation: 'Your usage during 12CP periods determines your share of provincial transmission costs for the following year.',
      },
      {
        id: 'aeso-3-3',
        question: 'When do 12CP peaks typically occur?',
        options: ['Late night hours', 'Early morning and late afternoon/evening', 'Random times', 'Weekends only'],
        correctIndex: 1,
        explanation: '12CP peaks typically occur during morning ramp-up (6-9 AM) and evening peak (4-7 PM) when demand is highest.',
      },
      {
        id: 'aeso-3-4',
        question: 'How long does a 12CP peak period typically last?',
        options: ['1 minute', '1 hour', '4 hours', '24 hours'],
        correctIndex: 1,
        explanation: 'Each 12CP event is based on a single hour - the highest demand hour of each month.',
      },
    ],
  },
  {
    sectionId: 'rate-65',
    title: 'Rate 65',
    questions: [
      {
        id: 'aeso-4-1',
        question: 'What is Rate 65 (DTS) in Alberta?',
        options: ['A sales tax rate', 'A direct transmission service rate for large consumers', 'A residential electricity rate', 'A fuel surcharge'],
        correctIndex: 1,
        explanation: 'Rate 65 (Demand Transmission Service) allows large consumers to connect directly to the transmission system, bypassing distribution costs.',
      },
      {
        id: 'aeso-4-2',
        question: 'What is typically the minimum load required for Rate 65 eligibility?',
        options: ['100 kW', '1 MW', '5 MW', '25 MW'],
        correctIndex: 2,
        explanation: 'Rate 65 is typically economical for loads of 5 MW or greater, though the exact threshold depends on various factors.',
      },
      {
        id: 'aeso-4-3',
        question: 'What is a key benefit of Rate 65 for Bitcoin miners?',
        options: ['Free electricity', 'Avoiding distribution charges and potential 12CP savings', 'Government subsidies', 'Unlimited power'],
        correctIndex: 1,
        explanation: 'Rate 65 allows miners to bypass distribution charges and directly manage their 12CP exposure for significant cost savings.',
      },
    ],
  },
  {
    sectionId: 'grid-operations',
    title: 'Grid Operations',
    questions: [
      {
        id: 'aeso-go-1',
        question: 'What frequency does Alberta\'s grid operate at?',
        options: ['50 Hz', '60 Hz', '100 Hz', 'Variable'],
        correctIndex: 1,
        explanation: 'Alberta\'s power grid operates at 60 Hz, the North American standard. Maintaining this frequency is critical for grid stability.',
      },
      {
        id: 'aeso-go-2',
        question: 'What is an Energy Emergency Alert (EEA)?',
        options: ['A billing notification', 'A warning that supply may not meet demand', 'A weather forecast', 'A maintenance schedule'],
        correctIndex: 1,
        explanation: 'EEAs are issued when AESO anticipates or experiences a shortage of generation to meet demand, with escalating severity levels.',
      },
      {
        id: 'aeso-go-3',
        question: 'What happens during an EEA Level 3?',
        options: ['Prices are capped', 'Rolling blackouts may occur', 'All generators restart', 'Nothing significant'],
        correctIndex: 1,
        explanation: 'EEA Level 3 is the most severe, indicating load shedding (controlled blackouts) is imminent or occurring to protect the grid.',
      },
    ],
  },
  {
    sectionId: 'generation-mix',
    title: 'Generation Mix',
    questions: [
      {
        id: 'aeso-gm-1',
        question: 'What is currently the largest source of electricity generation in Alberta?',
        options: ['Coal', 'Natural Gas', 'Wind', 'Solar'],
        correctIndex: 1,
        explanation: 'Natural gas has become the dominant generation source in Alberta, surpassing coal as the province transitions its energy mix.',
      },
      {
        id: 'aeso-gm-2',
        question: 'Which renewable source has grown fastest in Alberta?',
        options: ['Hydro', 'Wind', 'Solar', 'Biomass'],
        correctIndex: 1,
        explanation: 'Wind generation has seen the most rapid growth in Alberta, with installed capacity exceeding 4,500 MW.',
      },
      {
        id: 'aeso-gm-3',
        question: 'What is the capacity factor of wind generation in Alberta?',
        options: ['20-30%', '30-40%', '50-60%', '80-90%'],
        correctIndex: 1,
        explanation: 'Wind turbines in Alberta typically operate at 30-40% capacity factor due to intermittent wind conditions.',
      },
    ],
  },
  {
    sectionId: 'ancillary-services',
    title: 'Ancillary Services',
    questions: [
      {
        id: 'aeso-as-1',
        question: 'What is the purpose of Operating Reserves?',
        options: ['Store electricity', 'Provide backup capacity for grid reliability', 'Reduce prices', 'Generate revenue only'],
        correctIndex: 1,
        explanation: 'Operating Reserves provide standby capacity that can respond quickly to unexpected supply or demand changes, maintaining grid stability.',
      },
      {
        id: 'aeso-as-2',
        question: 'What is Regulating Reserve?',
        options: ['Long-term storage', 'Automatic second-by-second frequency response', 'Manual backup generation', 'Price regulation'],
        correctIndex: 1,
        explanation: 'Regulating Reserve provides automatic, continuous response to small frequency deviations through AGC (Automatic Generation Control).',
      },
      {
        id: 'aeso-as-3',
        question: 'Can flexible loads (like Bitcoin mining) participate in ancillary services?',
        options: ['No, only generators', 'Yes, as interruptible load', 'Only with government approval', 'Only during emergencies'],
        correctIndex: 1,
        explanation: 'Flexible loads can qualify as Supplemental Reserve by offering to curtail consumption quickly when dispatched by AESO.',
      },
    ],
  },
  {
    sectionId: 'ppa-guidance',
    title: 'Power Purchase Agreements',
    questions: [
      {
        id: 'aeso-ppa-1',
        question: 'What is a Power Purchase Agreement (PPA)?',
        options: ['A government subsidy', 'A contract to buy electricity at agreed terms', 'A type of generator', 'An AESO license'],
        correctIndex: 1,
        explanation: 'A PPA is a contract between a buyer and seller that defines the terms, price, and duration for electricity purchases.',
      },
      {
        id: 'aeso-ppa-2',
        question: 'What is the main advantage of a Fixed Price PPA?',
        options: ['Lower prices always', 'Price certainty and predictable costs', 'No contract needed', 'Government guarantees'],
        correctIndex: 1,
        explanation: 'Fixed PPAs provide price certainty, making budgeting easier and often required for debt financing of large projects.',
      },
      {
        id: 'aeso-ppa-3',
        question: 'What is a critical clause for Bitcoin miners in any PPA?',
        options: ['Color of contract', 'Volume flexibility to reduce consumption', 'Generator location', 'Paper vs digital contract'],
        correctIndex: 1,
        explanation: 'Volume flexibility allows miners to curtail during high prices or low BTC prices. Strict take-or-pay clauses can be very costly.',
      },
    ],
  },
];

// Mining Economics Quiz Data
export const MINING_ECONOMICS_QUIZZES: QuizSet[] = [
  {
    sectionId: 'revenue-drivers',
    title: 'Revenue Drivers',
    questions: [
      {
        id: 'me-rev-1',
        question: 'What are the two primary components of Bitcoin mining revenue?',
        options: ['Electricity sales and hardware resale', 'Block subsidy and transaction fees', 'Pool fees and block rewards', 'Hash rate and difficulty'],
        correctIndex: 1,
        explanation: 'Mining revenue consists of the block subsidy (newly minted BTC) and transaction fees paid by users for inclusion in a block.',
      },
      {
        id: 'me-rev-2',
        question: 'After the 2024 halving, what is the block subsidy?',
        options: ['6.25 BTC', '3.125 BTC', '1.5625 BTC', '12.5 BTC'],
        correctIndex: 1,
        explanation: 'The April 2024 halving reduced the block subsidy from 6.25 BTC to 3.125 BTC per block.',
      },
      {
        id: 'me-rev-3',
        question: 'What metric measures mining revenue per unit of hash power?',
        options: ['Hash price', 'Difficulty rate', 'Block time', 'Network fee rate'],
        correctIndex: 0,
        explanation: 'Hash price (typically USD/TH/day) measures the revenue earned per terahash per day, helping miners evaluate profitability.',
      },
    ],
  },
  {
    sectionId: 'cost-structure',
    title: 'Cost Structure',
    questions: [
      {
        id: 'me-cost-1',
        question: 'What is typically the largest operating expense for a Bitcoin mining facility?',
        options: ['Staff salaries', 'Electricity costs', 'Internet connectivity', 'Hardware maintenance'],
        correctIndex: 1,
        explanation: 'Electricity typically accounts for 60-80% of total operating costs in Bitcoin mining operations.',
      },
      {
        id: 'me-cost-2',
        question: 'What does "all-in cost per BTC" include?',
        options: ['Only electricity', 'Electricity and hosting', 'All operating and capital expenses amortized per BTC mined', 'Only hardware depreciation'],
        correctIndex: 2,
        explanation: 'All-in cost per BTC includes electricity, hosting, staff, maintenance, insurance, depreciation, and all other costs divided by BTC produced.',
      },
      {
        id: 'me-cost-3',
        question: 'What is a typical power cost target for competitive Bitcoin mining in 2025-2026?',
        options: ['$0.15-0.20/kWh', '$0.10-0.15/kWh', '$0.03-0.06/kWh', '$0.01/kWh or less'],
        correctIndex: 2,
        explanation: 'Competitive miners typically target $0.03-0.06/kWh to remain profitable after the 2024 halving.',
      },
    ],
  },
  {
    sectionId: 'break-even',
    title: 'Break-Even Analysis',
    questions: [
      {
        id: 'me-be-1',
        question: 'What determines the break-even electricity price for a mining operation?',
        options: ['Only BTC price', 'BTC price, hash rate, difficulty, and hardware efficiency', 'Only hardware cost', 'Network transaction volume'],
        correctIndex: 1,
        explanation: 'Break-even electricity price depends on BTC price, your share of network hash rate, current difficulty, and your hardware\'s J/TH efficiency.',
      },
      {
        id: 'me-be-2',
        question: 'How does a Bitcoin halving affect the break-even point?',
        options: ['No effect', 'Cuts revenue in half, requiring lower costs or higher BTC price', 'Doubles revenue', 'Only affects transaction fees'],
        correctIndex: 1,
        explanation: 'A halving cuts the block subsidy in half, effectively doubling the break-even cost unless BTC price rises proportionally.',
      },
      {
        id: 'me-be-3',
        question: 'What is a typical payback period target for new mining hardware?',
        options: ['1-3 months', '6-18 months', '3-5 years', '10+ years'],
        correctIndex: 1,
        explanation: 'Most operators target a 6-18 month payback period on hardware, accounting for difficulty increases and price volatility.',
      },
    ],
  },
];

// Mining Infrastructure (Datacenter) Quiz Data
export const DATACENTER_QUIZZES: QuizSet[] = [
  {
    sectionId: 'facility-design',
    title: 'Facility Design',
    questions: [
      {
        id: 'dc-fd-1',
        question: 'What is the typical power density of a Bitcoin mining datacenter compared to a traditional datacenter?',
        options: ['About the same', '2-3x higher', '5-10x higher', '50x higher'],
        correctIndex: 2,
        explanation: 'Bitcoin mining facilities typically run at 5-10x higher power density than traditional datacenters, often exceeding 30 kW per rack.',
      },
      {
        id: 'dc-fd-2',
        question: 'What is the primary advantage of containerized mining solutions?',
        options: ['Lower electricity costs', 'Rapid deployment and modularity', 'Better internet connectivity', 'Reduced noise levels'],
        correctIndex: 1,
        explanation: 'Containerized solutions allow rapid deployment (weeks vs months for buildings) and modular scaling of mining capacity.',
      },
      {
        id: 'dc-fd-3',
        question: 'What does PUE (Power Usage Effectiveness) measure?',
        options: ['Mining profitability', 'Total facility power vs IT equipment power ratio', 'Network uptime percentage', 'Cooling water flow rate'],
        correctIndex: 1,
        explanation: 'PUE = Total Facility Power / IT Equipment Power. A PUE of 1.0 is perfect efficiency; typical air-cooled mining facilities achieve 1.1-1.3.',
      },
    ],
  },
  {
    sectionId: 'cooling-systems',
    title: 'Cooling Systems',
    questions: [
      {
        id: 'dc-cool-1',
        question: 'What percentage of a mining facility\'s power is typically consumed by cooling?',
        options: ['1-3%', '5-15%', '25-35%', '40-50%'],
        correctIndex: 1,
        explanation: 'Cooling typically consumes 5-15% of total facility power in well-designed operations. Immersion cooling can reduce this to under 3%.',
      },
      {
        id: 'dc-cool-2',
        question: 'What is hot/cold aisle containment?',
        options: ['Temperature zoning for staff', 'Separating hot exhaust air from cold intake air to improve cooling efficiency', 'A fire suppression technique', 'A building insulation method'],
        correctIndex: 1,
        explanation: 'Hot/cold aisle containment physically separates hot exhaust air from cold supply air, preventing recirculation and improving cooling efficiency by 20-40%.',
      },
      {
        id: 'dc-cool-3',
        question: 'In cold climates like Alberta, what cooling technique is most energy-efficient?',
        options: ['Mechanical refrigeration year-round', 'Free-air cooling (economizer mode)', 'Underground cooling tunnels', 'Liquid nitrogen cooling'],
        correctIndex: 1,
        explanation: 'Free-air cooling uses cold outside air directly, eliminating compressor energy. Alberta\'s cold climate enables this for 8-10 months per year.',
      },
    ],
  },
  {
    sectionId: 'hardware',
    title: 'Mining Hardware',
    questions: [
      {
        id: 'dc-hw-1',
        question: 'What is the key efficiency metric when comparing ASIC miners?',
        options: ['Price per unit', 'Joules per Terahash (J/TH)', 'Physical size', 'Fan speed'],
        correctIndex: 1,
        explanation: 'J/TH measures how much energy is needed per unit of hash power. Lower J/TH means more efficient mining and lower electricity costs per hash.',
      },
      {
        id: 'dc-hw-2',
        question: 'What is the typical lifespan of an ASIC miner before it becomes uneconomical?',
        options: ['6 months', '2-4 years', '10-15 years', '20+ years'],
        correctIndex: 1,
        explanation: 'ASIC miners typically have an economic life of 2-4 years due to rapid efficiency improvements in newer models and increasing difficulty.',
      },
    ],
  },
];

// Electrical Infrastructure Quiz Data
export const ELECTRICAL_QUIZZES: QuizSet[] = [
  {
    sectionId: 'fundamentals',
    title: 'Electrical Fundamentals',
    questions: [
      {
        id: 'elec-fund-1',
        question: 'What is the relationship between voltage (V), current (I), and power (P)?',
        options: ['P = V + I', 'P = V × I', 'P = V / I', 'P = V² / I'],
        correctIndex: 1,
        explanation: 'Power equals voltage times current (P = V × I). This fundamental relationship determines wire sizing, breaker ratings, and transformer capacity.',
      },
      {
        id: 'elec-fund-2',
        question: 'Why do mining facilities prefer higher voltage distribution?',
        options: ['It is cheaper equipment', 'Higher voltage means lower current for the same power, reducing losses and wire costs', 'Government regulations require it', 'Miners run faster at higher voltage'],
        correctIndex: 1,
        explanation: 'Higher voltage means lower current for the same power (P = V × I), reducing I²R losses and allowing smaller, cheaper conductors.',
      },
      {
        id: 'elec-fund-3',
        question: 'What is power factor and why does it matter?',
        options: ['Speed of power delivery', 'Ratio of real power to apparent power, affecting utility bills and equipment sizing', 'Number of power sources', 'Voltage stability measurement'],
        correctIndex: 1,
        explanation: 'Power factor is the ratio of real power (kW) to apparent power (kVA). Low power factor wastes capacity and may incur utility penalties.',
      },
    ],
  },
  {
    sectionId: 'transformers',
    title: 'Power Transformers',
    questions: [
      {
        id: 'elec-tx-1',
        question: 'What is the typical voltage step-down sequence in a mining facility?',
        options: ['138kV → 480V directly', '138kV → 25kV → 480V (two stages)', '480V → 25kV → 138kV', '25kV → 138kV → 480V'],
        correctIndex: 1,
        explanation: 'Large mining facilities typically step down in stages: transmission voltage (69-138kV) → medium voltage (25kV) → utilization voltage (480V).',
      },
      {
        id: 'elec-tx-2',
        question: 'What is the maximum continuous loading for a typical power transformer?',
        options: ['50% of nameplate', '80% of nameplate (with margin for overloads)', '100% always', '150% in emergencies'],
        correctIndex: 1,
        explanation: 'Transformers are typically loaded to 80% maximum continuous to allow headroom for overloads, ambient temperature variations, and harmonic derating.',
      },
    ],
  },
  {
    sectionId: 'arc-flash',
    title: 'Arc Flash & Safety',
    questions: [
      {
        id: 'elec-af-1',
        question: 'What is an arc flash?',
        options: ['A software error', 'An explosive release of energy from an electrical fault through air', 'A type of lightning', 'A dimming of lights'],
        correctIndex: 1,
        explanation: 'An arc flash is a violent release of energy when current flows through air between conductors, reaching temperatures up to 35,000°F.',
      },
      {
        id: 'elec-af-2',
        question: 'What PPE category is typically required for work on energized 480V switchgear?',
        options: ['Category 0 (no PPE)', 'Category 1 (4 cal/cm²)', 'Category 2-3 (8-25 cal/cm²)', 'Category 4 (40 cal/cm²)'],
        correctIndex: 2,
        explanation: 'Energized 480V switchgear typically requires Category 2-3 PPE (8-25 cal/cm²), including arc-rated clothing, face shield, and gloves.',
      },
      {
        id: 'elec-af-3',
        question: 'What is LOTO (Lockout/Tagout)?',
        options: ['A type of circuit breaker', 'A procedure to ensure equipment is de-energized and cannot be restarted during maintenance', 'A voltage measurement tool', 'A transformer cooling method'],
        correctIndex: 1,
        explanation: 'LOTO is a safety procedure where energy sources are physically locked off and tagged to prevent accidental re-energization during maintenance.',
      },
    ],
  },
];

// Hydro Cooling Quiz Data
export const HYDRO_COOLING_QUIZZES: QuizSet[] = [
  {
    sectionId: 'cooling-methods',
    title: 'Cooling Methods',
    questions: [
      {
        id: 'hydro-cm-1',
        question: 'What is the primary advantage of hydro-cooled mining containers over air-cooled?',
        options: ['Lower upfront cost', 'Higher hash rate per unit', 'Significantly higher power density and better PUE', 'Easier maintenance'],
        correctIndex: 2,
        explanation: 'Hydro-cooled containers achieve 2-3x higher power density and PUE of 1.02-1.05 vs 1.2-1.4 for air-cooled systems.',
      },
      {
        id: 'hydro-cm-2',
        question: 'What coolant temperature range is typical for rear-door heat exchangers?',
        options: ['0-5°C', '15-25°C supply, 30-40°C return', '50-60°C', '80-100°C'],
        correctIndex: 1,
        explanation: 'Rear-door heat exchangers typically use 15-25°C supply water returning at 30-40°C, matching ASIC operating temperatures.',
      },
      {
        id: 'hydro-cm-3',
        question: 'What is a dry cooler and when is it used?',
        options: ['A dehumidifier', 'An air-to-water heat exchanger that rejects heat without evaporation', 'A refrigeration compressor', 'A fan array for miners'],
        correctIndex: 1,
        explanation: 'Dry coolers are air-to-water heat exchangers that reject heat to ambient air without water consumption. Ideal when ambient temp < coolant return temp.',
      },
    ],
  },
  {
    sectionId: 'water-systems',
    title: 'Water Systems',
    questions: [
      {
        id: 'hydro-ws-1',
        question: 'Why is water treatment important in hydro-cooled mining systems?',
        options: ['For drinking water quality', 'To prevent scaling, corrosion, and biological growth in cooling loops', 'Government regulation only', 'To improve hash rate'],
        correctIndex: 1,
        explanation: 'Untreated water causes scaling (reduced heat transfer), corrosion (leaks), and biological growth (blockages) in cooling systems.',
      },
      {
        id: 'hydro-ws-2',
        question: 'What is a closed-loop cooling system?',
        options: ['A system that recirculates the same coolant without evaporative losses', 'A system open to atmosphere', 'A single-pass water system', 'An air-cooled system'],
        correctIndex: 0,
        explanation: 'Closed-loop systems recirculate treated coolant, minimizing water consumption and contamination compared to open cooling towers.',
      },
    ],
  },
  {
    sectionId: 'economics',
    title: 'Hydro Cooling Economics',
    questions: [
      {
        id: 'hydro-econ-1',
        question: 'What is the typical ROI advantage of hydro-cooled over air-cooled mining?',
        options: ['No financial difference', '5-15% better ROI due to higher density and efficiency', '50%+ better ROI', 'Air-cooled is always better financially'],
        correctIndex: 1,
        explanation: 'Hydro-cooled systems typically deliver 5-15% better ROI through higher power density (lower $/MW site cost) and reduced cooling energy.',
      },
      {
        id: 'hydro-econ-2',
        question: 'What additional revenue stream can hydro-cooled facilities capture?',
        options: ['Cryptocurrency staking', 'Waste heat recovery for heating nearby buildings or greenhouses', 'Selling excess water', 'Internet resale'],
        correctIndex: 1,
        explanation: 'Hydro-cooled systems produce 30-40°C water that can heat greenhouses, buildings, or industrial processes, generating additional revenue.',
      },
    ],
  },
];

// Immersion Cooling Quiz Data
export const IMMERSION_COOLING_QUIZZES: QuizSet[] = [
  {
    sectionId: 'fluids',
    title: 'Dielectric Fluids',
    questions: [
      {
        id: 'imm-fl-1',
        question: 'What property makes a fluid suitable for immersion cooling?',
        options: ['High viscosity', 'Dielectric (electrically non-conductive) properties', 'High electrical conductivity', 'Strong odor'],
        correctIndex: 1,
        explanation: 'Dielectric fluids are electrically non-conductive, allowing direct contact with electronics without short circuits.',
      },
      {
        id: 'imm-fl-2',
        question: 'What is the typical boiling point range for single-phase immersion fluids?',
        options: ['Below 50°C', '60-80°C', 'Above 200°C (they do not boil in normal operation)', '100°C exactly'],
        correctIndex: 2,
        explanation: 'Single-phase fluids have high boiling points (>200°C), remaining liquid throughout. Two-phase fluids boil at 49-60°C for enhanced heat transfer.',
      },
      {
        id: 'imm-fl-3',
        question: 'Which is a common single-phase immersion cooling fluid?',
        options: ['Water', 'Mineral oil or engineered hydrocarbons', 'Mercury', 'Liquid nitrogen'],
        correctIndex: 1,
        explanation: 'Mineral oil and engineered hydrocarbon fluids (e.g., BitCool, Engineered Fluids) are widely used for single-phase immersion cooling.',
      },
    ],
  },
  {
    sectionId: 'tank-systems',
    title: 'Tank System Design',
    questions: [
      {
        id: 'imm-tank-1',
        question: 'What is the typical power density of immersion-cooled mining vs air-cooled?',
        options: ['Same density', '2-3x higher', '5-10x higher', '100x higher'],
        correctIndex: 1,
        explanation: 'Immersion cooling enables 2-3x higher power density per square foot compared to air-cooled, reducing facility footprint.',
      },
      {
        id: 'imm-tank-2',
        question: 'What maintenance advantage does immersion cooling provide?',
        options: ['No maintenance needed ever', 'Eliminates dust/particle contamination and fan failures', 'Self-cleaning circuits', 'Automatic hardware upgrades'],
        correctIndex: 1,
        explanation: 'Immersion eliminates airborne dust contamination (a leading cause of failures) and removes fans as a failure point.',
      },
    ],
  },
  {
    sectionId: 'overclocking',
    title: 'Overclocking Benefits',
    questions: [
      {
        id: 'imm-oc-1',
        question: 'Why does immersion cooling enable higher overclocking?',
        options: ['Software unlock', 'Superior heat dissipation allows chips to run hotter without throttling', 'Lower voltage requirements', 'Faster internet connection'],
        correctIndex: 1,
        explanation: 'Immersion provides 10-100x better heat transfer than air, keeping chips within safe temperatures even at 20-50% overclock.',
      },
      {
        id: 'imm-oc-2',
        question: 'What is the typical hash rate gain from immersion cooling with overclocking?',
        options: ['0-5%', '10-30%', '50-100%', '200%+'],
        correctIndex: 1,
        explanation: 'Immersion cooling typically enables 10-30% higher hash rates through overclocking while maintaining safe chip temperatures.',
      },
    ],
  },
];

// Operations & Maintenance Quiz Data
export const OPERATIONS_QUIZZES: QuizSet[] = [
  {
    sectionId: 'monitoring',
    title: 'Monitoring Systems',
    questions: [
      {
        id: 'ops-mon-1',
        question: 'What are the key metrics to monitor in a Bitcoin mining facility?',
        options: ['Only hash rate', 'Hash rate, temperature, power consumption, and uptime', 'Only electricity bill', 'Only BTC price'],
        correctIndex: 1,
        explanation: 'Comprehensive monitoring includes hash rate, chip/ambient temperature, power consumption, uptime, fan speeds, and error rates.',
      },
      {
        id: 'ops-mon-2',
        question: 'What uptime percentage is considered industry standard for mining operations?',
        options: ['80%', '90%', '95-98%', '100%'],
        correctIndex: 2,
        explanation: '95-98% uptime is the industry standard. Each 1% of downtime on a 10MW facility can cost $15,000-40,000/month in lost revenue.',
      },
      {
        id: 'ops-mon-3',
        question: 'What is SNMP and why is it used in mining?',
        options: ['A cryptocurrency protocol', 'Simple Network Management Protocol for remotely monitoring and managing network devices', 'A cooling system brand', 'A power measurement unit'],
        correctIndex: 1,
        explanation: 'SNMP enables centralized monitoring of thousands of miners, switches, and PDUs from a single management platform.',
      },
    ],
  },
  {
    sectionId: 'preventive-maintenance',
    title: 'Preventive Maintenance',
    questions: [
      {
        id: 'ops-pm-1',
        question: 'How often should air filters be cleaned in an air-cooled mining facility?',
        options: ['Once a year', 'Every 1-4 weeks depending on environment', 'Only when miners overheat', 'Never - they are self-cleaning'],
        correctIndex: 1,
        explanation: 'Air filters should be cleaned every 1-4 weeks depending on dust levels. Clogged filters reduce airflow and increase temperatures.',
      },
      {
        id: 'ops-pm-2',
        question: 'What is predictive maintenance?',
        options: ['Fixing things after they break', 'Using data and analytics to predict failures before they occur', 'Scheduled maintenance regardless of condition', 'Replacing all hardware annually'],
        correctIndex: 1,
        explanation: 'Predictive maintenance uses sensor data, vibration analysis, and trends to identify equipment likely to fail, allowing proactive repair.',
      },
      {
        id: 'ops-pm-3',
        question: 'What is the most common cause of ASIC miner failure?',
        options: ['Software bugs', 'Overheating and thermal stress', 'Power surges', 'Physical impact'],
        correctIndex: 1,
        explanation: 'Overheating is the leading cause of ASIC failure. Maintaining proper airflow, cooling, and ambient temperature is critical.',
      },
    ],
  },
];

// Noise Management Quiz Data
export const NOISE_QUIZZES: QuizSet[] = [
  {
    sectionId: 'fundamentals',
    title: 'Sound Fundamentals',
    questions: [
      {
        id: 'noise-fund-1',
        question: 'How loud is a typical Bitcoin mining facility at 1 meter?',
        options: ['40 dBA (quiet office)', '60 dBA (conversation)', '80-95 dBA (lawnmower to chainsaw)', '120 dBA (jet engine)'],
        correctIndex: 2,
        explanation: 'A single ASIC miner produces ~75-80 dBA. A facility with hundreds of miners reaches 80-95 dBA at close range.',
      },
      {
        id: 'noise-fund-2',
        question: 'How does the decibel (dB) scale work?',
        options: ['Linear - 20 dB is twice as loud as 10 dB', 'Logarithmic - every 10 dB increase doubles perceived loudness', 'Exponential - 20 dB is 4x louder than 10 dB', 'Random - no consistent relationship'],
        correctIndex: 1,
        explanation: 'The dB scale is logarithmic. Every 10 dB increase represents roughly a doubling of perceived loudness and a 10x increase in sound energy.',
      },
      {
        id: 'noise-fund-3',
        question: 'How much does sound level decrease when you double the distance from the source?',
        options: ['No change', '3 dB decrease', '6 dB decrease (inverse square law)', '12 dB decrease'],
        correctIndex: 2,
        explanation: 'Sound follows the inverse square law: every doubling of distance reduces sound pressure level by approximately 6 dB.',
      },
    ],
  },
  {
    sectionId: 'standards',
    title: 'Regulations & Standards',
    questions: [
      {
        id: 'noise-reg-1',
        question: 'What is the typical nighttime noise limit at a residential property boundary in Alberta?',
        options: ['20 dBA', '40 dBA (PSL)', '70 dBA', 'No limit exists'],
        correctIndex: 1,
        explanation: 'Alberta\'s Permissible Sound Level (PSL) at residential boundaries is typically 40 dBA nighttime / 50 dBA daytime under AER Directive 038.',
      },
      {
        id: 'noise-reg-2',
        question: 'What is a noise impact assessment (NIA)?',
        options: ['An insurance policy', 'A study predicting facility noise levels at receptor locations to ensure compliance', 'A type of sound barrier', 'A government tax'],
        correctIndex: 1,
        explanation: 'An NIA uses acoustic modeling to predict noise propagation from a proposed facility to nearby receptors, required for permitting.',
      },
    ],
  },
  {
    sectionId: 'mitigation',
    title: 'Mitigation Techniques',
    questions: [
      {
        id: 'noise-mit-1',
        question: 'What is the most cost-effective noise mitigation strategy?',
        options: ['Sound barriers after construction', 'Maximizing distance (setback) from receptors during site selection', 'Replacing all miners with quieter models', 'Operating only during daytime'],
        correctIndex: 1,
        explanation: 'Distance is the cheapest mitigation: every doubling of distance reduces noise by 6 dB. Selecting sites with large setbacks is most cost-effective.',
      },
      {
        id: 'noise-mit-2',
        question: 'How much noise reduction can a properly designed sound barrier provide?',
        options: ['1-2 dB', '5-15 dB', '30-40 dB', '60+ dB'],
        correctIndex: 1,
        explanation: 'A solid sound barrier can reduce noise by 5-15 dB depending on height, material, and positioning. Performance is limited by sound diffraction.',
      },
      {
        id: 'noise-mit-3',
        question: 'What is acoustic louvering?',
        options: ['A music technique', 'Ventilation openings with sound-absorbing baffles that allow airflow while reducing noise', 'A type of speaker', 'Soundproof windows'],
        correctIndex: 1,
        explanation: 'Acoustic louvres allow necessary ventilation airflow while absorbing sound energy, typically providing 10-20 dB noise reduction.',
      },
    ],
  },
];

// Taxes & Insurance Quiz Data
export const TAXES_INSURANCE_QUIZZES: QuizSet[] = [
  {
    sectionId: 'crypto-tax',
    title: 'Crypto Tax Treatment',
    questions: [
      {
        id: 'tax-ct-1',
        question: 'How is mined Bitcoin typically taxed in Canada?',
        options: ['Not taxable', 'As business income at fair market value when mined', 'Only when sold', 'As capital gains only'],
        correctIndex: 1,
        explanation: 'In Canada, mined cryptocurrency is generally treated as business income, valued at fair market value at the time of receipt.',
      },
      {
        id: 'tax-ct-2',
        question: 'What is the CCA (Capital Cost Allowance) class for ASIC miners in Canada?',
        options: ['Class 8 (20%)', 'Class 10 (30%)', 'Class 50 (55%) for computer equipment', 'Not depreciable'],
        correctIndex: 2,
        explanation: 'ASIC miners are typically classified as Class 50 (55% declining balance) under CCA rules for computer/electronic equipment.',
      },
      {
        id: 'tax-ct-3',
        question: 'What is the GST/HST treatment for Bitcoin mining in Canada?',
        options: ['Exempt', 'Mining is a taxable supply but mined crypto is not subject to GST', 'Full GST on all revenue', 'Only provincial tax applies'],
        correctIndex: 1,
        explanation: 'Bitcoin mining is generally considered a commercial activity, allowing GST/HST input tax credits on expenses, though the crypto itself is treated as an exempt financial instrument.',
      },
    ],
  },
  {
    sectionId: 'property-insurance',
    title: 'Property & Equipment Insurance',
    questions: [
      {
        id: 'tax-pi-1',
        question: 'What is the biggest insurance challenge for Bitcoin mining facilities?',
        options: ['Finding any insurer willing to cover crypto operations', 'Low premiums', 'Too many insurance options', 'Simple claims process'],
        correctIndex: 0,
        explanation: 'Many traditional insurers are unfamiliar with or unwilling to cover crypto mining. Specialty insurers or Lloyd\'s syndicates are often needed.',
      },
      {
        id: 'tax-pi-2',
        question: 'What type of insurance covers loss of mining revenue during equipment downtime?',
        options: ['Property insurance', 'Business interruption (BI) insurance', 'Liability insurance', 'Workers compensation'],
        correctIndex: 1,
        explanation: 'Business interruption insurance compensates for lost revenue when covered events (fire, equipment failure) cause operational downtime.',
      },
      {
        id: 'tax-pi-3',
        question: 'Why should mining equipment be insured at replacement cost rather than actual cash value?',
        options: ['It is cheaper', 'Because rapid depreciation means ACV payout may not cover replacement of essential equipment', 'Replacement cost is always lower', 'There is no difference'],
        correctIndex: 1,
        explanation: 'ASIC miners depreciate quickly. ACV policies pay depreciated value, which may not cover buying replacement hardware at current market prices.',
      },
    ],
  },
];

// Engineering & Permitting Quiz Data
export const ENGINEERING_PERMITTING_QUIZZES: QuizSet[] = [
  {
    sectionId: 'regulatory',
    title: 'Regulatory Landscape',
    questions: [
      {
        id: 'ep-reg-1',
        question: 'Which Alberta body regulates electricity market participants and power plant approvals?',
        options: ['AESO', 'AUC (Alberta Utilities Commission)', 'Municipal government only', 'Federal government'],
        correctIndex: 1,
        explanation: 'The AUC regulates utilities and approves power plants, including industrial loads like large-scale Bitcoin mining facilities.',
      },
      {
        id: 'ep-reg-2',
        question: 'What is AESO\'s role in the permitting process?',
        options: ['Building inspections', 'Managing grid connection applications and transmission planning', 'Issuing business licenses', 'Environmental monitoring'],
        correctIndex: 1,
        explanation: 'AESO manages connection applications, transmission access, and ensures grid reliability for new loads like mining facilities.',
      },
      {
        id: 'ep-reg-3',
        question: 'What trigger typically requires a formal AUC power plant application?',
        options: ['Any electrical work', 'Loads exceeding 10MW or generation facilities', 'Having more than 5 employees', 'Using natural gas'],
        correctIndex: 1,
        explanation: 'Large industrial loads (typically >10MW) or generation facilities require AUC approval, including detailed facility and impact assessments.',
      },
    ],
  },
  {
    sectionId: 'municipal',
    title: 'Municipal Permits',
    questions: [
      {
        id: 'ep-mun-1',
        question: 'What is a Development Permit (DP)?',
        options: ['Federal government permission', 'Municipal approval for land use and building construction based on zoning bylaws', 'AESO grid connection', 'Environmental assessment'],
        correctIndex: 1,
        explanation: 'A Development Permit confirms the proposed use (e.g., industrial datacenter) is allowed under the municipal land use bylaw/zoning.',
      },
      {
        id: 'ep-mun-2',
        question: 'Why is zoning critical for mining facility site selection?',
        options: ['It determines electricity rates', 'Industrial zoning is required, and noise/setback requirements vary by zone', 'It only affects property taxes', 'Zoning is optional in Alberta'],
        correctIndex: 1,
        explanation: 'Mining facilities typically require industrial zoning. Residential or agricultural zones may prohibit the noise, traffic, and scale of mining operations.',
      },
    ],
  },
  {
    sectionId: 'aeso',
    title: 'AESO Connection Process',
    questions: [
      {
        id: 'ep-aeso-1',
        question: 'How long does a typical AESO connection process take?',
        options: ['1-2 weeks', '2-4 months', '6-18 months', '3-5 years'],
        correctIndex: 2,
        explanation: 'AESO connections typically take 6-18 months depending on complexity, required upgrades, and whether new transmission infrastructure is needed.',
      },
      {
        id: 'ep-aeso-2',
        question: 'What is a System Impact Study?',
        options: ['A marketing analysis', 'AESO\'s assessment of how a new load/generation affects grid stability and required upgrades', 'A noise study', 'An insurance evaluation'],
        correctIndex: 1,
        explanation: 'A System Impact Study evaluates whether the grid can accommodate the new load and identifies any transmission upgrades required.',
      },
      {
        id: 'ep-aeso-3',
        question: 'Who pays for transmission upgrades required by a new mining facility connection?',
        options: ['The government always pays', 'The connecting party pays customer contribution, with some costs socialized across ratepayers', 'The utility pays everything', 'No upgrades are ever needed'],
        correctIndex: 1,
        explanation: 'Customer contribution rules determine the connecting party\'s share. Some upgrade costs are socialized through transmission tariffs paid by all ratepayers.',
      },
    ],
  },
];

// Networking Quiz Data
export const NETWORKING_QUIZZES: QuizSet[] = [
  {
    sectionId: 'connectivity',
    title: 'ISP & Connectivity',
    questions: [
      {
        id: 'net-isp-1',
        question: 'What bandwidth does a Bitcoin mining facility typically require per MW?',
        options: ['1 Gbps per MW', '5-10 Mbps per MW', '100 Mbps per MW', '1 Tbps per MW'],
        correctIndex: 1,
        explanation: 'Bitcoin mining has surprisingly low bandwidth requirements. 5-10 Mbps per MW is typical since miners only transmit small work packets.',
      },
      {
        id: 'net-isp-2',
        question: 'What is more important than bandwidth for mining network connectivity?',
        options: ['Download speed', 'Latency and reliability (uptime)', 'Number of IP addresses', 'WiFi coverage'],
        correctIndex: 1,
        explanation: 'Low latency and high reliability are critical. Even brief outages cause stale shares and lost revenue. Bandwidth needs are minimal.',
      },
      {
        id: 'net-isp-3',
        question: 'Why do mining facilities often use dual ISP connections?',
        options: ['Twice the bandwidth', 'Redundancy - if one ISP fails, operations continue on the backup', 'Required by law', 'Lower cost per Mbps'],
        correctIndex: 1,
        explanation: 'Dual ISP connections provide failover redundancy. Auto-switching ensures mining continues even if the primary connection fails.',
      },
    ],
  },
  {
    sectionId: 'security',
    title: 'Network Security',
    questions: [
      {
        id: 'net-sec-1',
        question: 'What is the primary network security risk for a mining facility?',
        options: ['Cryptocurrency theft from wallets on miners', 'Unauthorized access to management interfaces enabling hash rate theft', 'Physical cable theft', 'Email phishing'],
        correctIndex: 1,
        explanation: 'Attackers who access miner management interfaces can redirect hash rate to their own pools, stealing mining output without touching wallets.',
      },
      {
        id: 'net-sec-2',
        question: 'What network segmentation strategy is recommended for mining facilities?',
        options: ['One flat network for everything', 'Separate VLANs for management, mining traffic, and monitoring', 'No network needed', 'Only wireless networks'],
        correctIndex: 1,
        explanation: 'VLAN segmentation isolates management (sensitive), mining stratum traffic, and monitoring/IoT into separate secure zones.',
      },
      {
        id: 'net-sec-3',
        question: 'What protocol do miners use to communicate with mining pools?',
        options: ['HTTP', 'Stratum (V1 or V2)', 'FTP', 'SMTP'],
        correctIndex: 1,
        explanation: 'Stratum protocol (V1 or the newer V2 with encryption) is used for communication between miners and pools for work distribution and share submission.',
      },
    ],
  },
  {
    sectionId: 'redundancy',
    title: 'Network Redundancy',
    questions: [
      {
        id: 'net-red-1',
        question: 'What does BGP (Border Gateway Protocol) enable for mining facilities?',
        options: ['Faster mining', 'Multi-homed internet with automatic failover between ISPs', 'Lower electricity costs', 'Better cooling'],
        correctIndex: 1,
        explanation: 'BGP allows facilities to advertise their IP space via multiple ISPs, enabling seamless automatic failover if one provider fails.',
      },
      {
        id: 'net-red-2',
        question: 'What is the recommended approach for DNS in mining operations?',
        options: ['Use a single public DNS server', 'Run local DNS servers with caching and multiple upstream resolvers', 'DNS is not needed for mining', 'Use only ISP-provided DNS'],
        correctIndex: 1,
        explanation: 'Local DNS with caching reduces external dependency and latency. Multiple upstream resolvers provide redundancy for pool hostname resolution.',
      },
    ],
  },
];

// Strategic Operations Masterclass Quiz Data
export const STRATEGIC_OPERATIONS_QUIZZES: QuizSet[] = [
  {
    sectionId: 'track-1',
    title: 'Site Selection',
    questions: [
      {
        id: 'strat-ss-1',
        question: 'What is the single most important factor in mining site selection?',
        options: ['Proximity to cities', 'Access to low-cost, reliable power', 'Climate/temperature', 'Internet bandwidth'],
        correctIndex: 1,
        explanation: 'Power cost is the dominant factor since electricity is 60-80% of operating costs. Even 1¢/kWh difference significantly impacts profitability.',
      },
      {
        id: 'strat-ss-2',
        question: 'What is a "behind-the-meter" mining arrangement?',
        options: ['Mining in a closet', 'Co-locating miners directly at a power generation source before the utility meter', 'Underground mining', 'Using battery storage'],
        correctIndex: 1,
        explanation: 'Behind-the-meter arrangements connect directly to generation, avoiding transmission and distribution charges, often achieving the lowest power costs.',
      },
      {
        id: 'strat-ss-3',
        question: 'What is a site scoring matrix?',
        options: ['A GPS tool', 'A weighted evaluation framework comparing multiple potential sites across key criteria', 'A construction blueprint', 'A financial report'],
        correctIndex: 1,
        explanation: 'A site scoring matrix assigns weights to criteria (power cost, reliability, permits, climate, connectivity) and scores each site objectively.',
      },
    ],
  },
  {
    sectionId: 'track-2',
    title: 'Risk Management',
    questions: [
      {
        id: 'strat-rm-1',
        question: 'What is the biggest market risk for Bitcoin mining operations?',
        options: ['Equipment theft', 'Bitcoin price volatility combined with fixed operating costs', 'Employee turnover', 'Internet outages'],
        correctIndex: 1,
        explanation: 'BTC price volatility is the primary market risk. Fixed costs (power contracts, leases, staff) continue regardless of BTC price movements.',
      },
      {
        id: 'strat-rm-2',
        question: 'What hedging strategy can miners use to manage BTC price risk?',
        options: ['Buying more miners', 'Selling a portion of future production via futures or forward contracts', 'Ignoring the risk', 'Only selling during bull markets'],
        correctIndex: 1,
        explanation: 'Miners can hedge by selling BTC futures or entering forward contracts, locking in prices for a portion of production to cover fixed costs.',
      },
      {
        id: 'strat-rm-3',
        question: 'What is regulatory risk in the context of Bitcoin mining?',
        options: ['Risk of hardware failure', 'Risk of governments changing laws, taxes, or energy policies affecting operations', 'Risk of pool downtime', 'Risk of internet censorship'],
        correctIndex: 1,
        explanation: 'Regulatory risk includes potential changes to energy policy, crypto regulations, taxation, or zoning that could increase costs or restrict operations.',
      },
    ],
  },
  {
    sectionId: 'track-4',
    title: 'Scaling Operations',
    questions: [
      {
        id: 'strat-sc-1',
        question: 'What is the primary advantage of a multi-site mining strategy?',
        options: ['Simpler management', 'Geographic and power source diversification reducing concentration risk', 'Lower total cost', 'Faster internet'],
        correctIndex: 1,
        explanation: 'Multi-site strategies diversify against single-point failures: regional power issues, weather events, regulatory changes, or facility-specific risks.',
      },
      {
        id: 'strat-sc-2',
        question: 'When scaling from 5MW to 50MW, what changes most significantly?',
        options: ['Mining software', 'Organizational complexity, capital requirements, and regulatory obligations', 'Bitcoin protocol', 'Miner manufacturer options'],
        correctIndex: 1,
        explanation: 'Scaling 10x requires proportionally more complex organization, significantly more capital, and often triggers additional regulatory requirements.',
      },
    ],
  },
];
