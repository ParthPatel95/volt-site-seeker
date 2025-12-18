export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example?: string;
  category: string;
}

export interface FlashcardDeck {
  deckId: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

// Bitcoin Terminology Flashcards
export const BITCOIN_FLASHCARDS: FlashcardDeck = {
  deckId: 'bitcoin-terms',
  title: 'Bitcoin Terminology',
  description: 'Master the essential terms used in Bitcoin and cryptocurrency',
  cards: [
    {
      id: 'btc-fc-1',
      term: 'Satoshi (sat)',
      definition: 'The smallest unit of Bitcoin, equal to 0.00000001 BTC (one hundred millionth of a Bitcoin).',
      example: '100,000 satoshis = 0.001 BTC',
      category: 'Units',
    },
    {
      id: 'btc-fc-2',
      term: 'Blockchain',
      definition: 'A distributed, immutable ledger that records all Bitcoin transactions across a network of computers.',
      example: 'Each block contains ~2,000 transactions and links to the previous block.',
      category: 'Technology',
    },
    {
      id: 'btc-fc-3',
      term: 'Hash Rate',
      definition: 'The computational power used by miners to process transactions, measured in hashes per second.',
      example: 'Modern ASICs achieve 100+ TH/s (terahashes per second).',
      category: 'Mining',
    },
    {
      id: 'btc-fc-4',
      term: 'Halving',
      definition: 'A scheduled event every ~4 years (210,000 blocks) that cuts the mining reward in half.',
      example: '2024: 6.25 BTC → 3.125 BTC per block.',
      category: 'Economics',
    },
    {
      id: 'btc-fc-5',
      term: 'Private Key',
      definition: 'A secret cryptographic code that proves ownership and allows spending of Bitcoin.',
      example: 'Never share your private key - it controls access to your funds.',
      category: 'Security',
    },
    {
      id: 'btc-fc-6',
      term: 'Mempool',
      definition: 'The waiting area for unconfirmed transactions before they are included in a block.',
      example: 'High mempool = network congestion = higher fees.',
      category: 'Network',
    },
    {
      id: 'btc-fc-7',
      term: 'ASIC',
      definition: 'Application-Specific Integrated Circuit - specialized hardware designed solely for Bitcoin mining.',
      example: 'Bitmain Antminer S21: 200 TH/s at 17.5 J/TH.',
      category: 'Hardware',
    },
    {
      id: 'btc-fc-8',
      term: 'Difficulty Adjustment',
      definition: 'Automatic recalibration every 2,016 blocks (~2 weeks) to maintain 10-minute block times.',
      example: 'If blocks are found too fast, difficulty increases.',
      category: 'Mining',
    },
    {
      id: 'btc-fc-9',
      term: 'Cold Storage',
      definition: 'Keeping Bitcoin private keys offline, disconnected from the internet for maximum security.',
      example: 'Hardware wallets like Ledger or Trezor provide cold storage.',
      category: 'Security',
    },
    {
      id: 'btc-fc-10',
      term: 'Lightning Network',
      definition: 'A Layer 2 scaling solution enabling fast, low-cost Bitcoin payments off-chain.',
      example: 'Enables instant micropayments with near-zero fees.',
      category: 'Technology',
    },
  ],
};

// AESO Terminology Flashcards
export const AESO_FLASHCARDS: FlashcardDeck = {
  deckId: 'aeso-terms',
  title: 'AESO & Energy Market Terms',
  description: 'Key terminology for understanding Alberta\'s electricity market',
  cards: [
    {
      id: 'aeso-fc-1',
      term: 'Pool Price',
      definition: 'The hourly wholesale price of electricity in Alberta, set by the marginal generator.',
      example: 'Pool prices can range from $0 to $1,000/MWh.',
      category: 'Pricing',
    },
    {
      id: 'aeso-fc-2',
      term: '12CP (12 Coincident Peaks)',
      definition: 'The 12 monthly system peak hours that determine transmission cost allocation for the following year.',
      example: 'Reducing load during 12CP can save millions annually.',
      category: 'Transmission',
    },
    {
      id: 'aeso-fc-3',
      term: 'Rate 65 (DTS)',
      definition: 'Demand Transmission Service rate allowing large consumers to connect directly to the transmission grid.',
      example: 'Typically economical for loads ≥5 MW.',
      category: 'Rates',
    },
    {
      id: 'aeso-fc-4',
      term: 'System Marginal Price (SMP)',
      definition: 'The price of the last (most expensive) generator dispatched to meet demand.',
      example: 'SMP sets the pool price for all generators that hour.',
      category: 'Pricing',
    },
    {
      id: 'aeso-fc-5',
      term: 'AIL (Alberta Internal Load)',
      definition: 'Total electricity demand within Alberta at any given time.',
      example: 'AIL typically ranges from 8,000-12,000 MW.',
      category: 'Demand',
    },
    {
      id: 'aeso-fc-6',
      term: 'Merit Order',
      definition: 'The ranking of generators from lowest to highest price offer, determining dispatch order.',
      example: 'Wind and solar typically bid $0, natural gas bids higher.',
      category: 'Market',
    },
    {
      id: 'aeso-fc-7',
      term: 'Transmission Must Run (TMR)',
      definition: 'Generators required to operate for grid reliability, regardless of their price offer.',
      example: 'TMR generators help maintain voltage and stability.',
      category: 'Operations',
    },
    {
      id: 'aeso-fc-8',
      term: 'Operating Reserve',
      definition: 'Standby generation capacity held in reserve to handle unexpected supply or demand changes.',
      example: 'AESO maintains spinning and supplemental reserves.',
      category: 'Reliability',
    },
    {
      id: 'aeso-fc-9',
      term: 'Intertie',
      definition: 'Transmission connections between Alberta and neighboring grids (BC, Saskatchewan, Montana).',
      example: 'Interties allow import/export of electricity.',
      category: 'Infrastructure',
    },
    {
      id: 'aeso-fc-10',
      term: 'Load Factor',
      definition: 'The ratio of average load to peak load, indicating how consistently a facility uses power.',
      example: 'Bitcoin mining: ~95% load factor. Office building: ~40%.',
      category: 'Efficiency',
    },
  ],
};

// Electrical Infrastructure Flashcards
export const ELECTRICAL_FLASHCARDS: FlashcardDeck = {
  deckId: 'electrical-terms',
  title: 'Electrical Infrastructure Terms',
  description: 'Essential electrical engineering terminology for datacenter operations',
  cards: [
    {
      id: 'elec-fc-1',
      term: 'Transformer',
      definition: 'A device that changes voltage levels (step-up or step-down) using electromagnetic induction.',
      example: '138kV to 25kV step-down for distribution.',
      category: 'Equipment',
    },
    {
      id: 'elec-fc-2',
      term: 'Power Factor',
      definition: 'The ratio of real power (kW) to apparent power (kVA), measuring electrical efficiency.',
      example: 'Target: 0.95 or higher. Below 0.85 incurs penalties.',
      category: 'Efficiency',
    },
    {
      id: 'elec-fc-3',
      term: 'THD (Total Harmonic Distortion)',
      definition: 'A measure of waveform distortion caused by non-linear loads like power supplies.',
      example: 'IEEE 519 limits: ≤5% THD at PCC.',
      category: 'Power Quality',
    },
    {
      id: 'elec-fc-4',
      term: 'Arc Flash',
      definition: 'A dangerous electrical explosion caused by a fault, reaching temperatures up to 35,000°F.',
      example: 'PPE categories range from 4 to 40 cal/cm².',
      category: 'Safety',
    },
    {
      id: 'elec-fc-5',
      term: 'Switchgear',
      definition: 'Equipment used to de-energize circuits for maintenance and protect from faults.',
      example: 'Medium-voltage switchgear handles 1kV-38kV.',
      category: 'Equipment',
    },
    {
      id: 'elec-fc-6',
      term: 'PUE (Power Usage Effectiveness)',
      definition: 'Ratio of total facility power to IT equipment power, measuring datacenter efficiency.',
      example: 'Air-cooled: 1.4-1.6 PUE. Immersion: 1.02-1.05 PUE.',
      category: 'Efficiency',
    },
    {
      id: 'elec-fc-7',
      term: 'kVA vs kW',
      definition: 'kVA is apparent power (voltage × current), kW is real power that does actual work.',
      example: 'kW = kVA × Power Factor',
      category: 'Units',
    },
    {
      id: 'elec-fc-8',
      term: 'N+1 Redundancy',
      definition: 'Having one additional backup component beyond minimum requirements.',
      example: 'Two 2MW transformers for a 2MW load.',
      category: 'Reliability',
    },
  ],
};
