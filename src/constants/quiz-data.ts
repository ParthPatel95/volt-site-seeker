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
