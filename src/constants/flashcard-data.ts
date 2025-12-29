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
    {
      id: 'btc-fc-11',
      term: 'secp256k1',
      definition: 'The elliptic curve used by Bitcoin for ECDSA and Schnorr signatures. Named from Standards for Efficient Cryptography.',
      example: 'Equation: y² = x³ + 7 (mod p)',
      category: 'Cryptography',
    },
    {
      id: 'btc-fc-12',
      term: 'UTXO',
      definition: 'Unspent Transaction Output - the fundamental unit of Bitcoin ownership. Each UTXO can only be spent once.',
      example: 'Inputs reference previous UTXOs, outputs create new UTXOs.',
      category: 'Transactions',
    },
    {
      id: 'btc-fc-13',
      term: 'Taproot',
      definition: 'Bitcoin upgrade (November 2021) enabling Schnorr signatures, key aggregation, and private complex scripts.',
      example: 'P2TR addresses start with bc1p...',
      category: 'Technology',
    },
    {
      id: 'btc-fc-14',
      term: 'Merkle Root',
      definition: 'A single hash representing all transactions in a block, enabling efficient verification via Merkle proofs.',
      example: 'Changed in each block header as transactions are added.',
      category: 'Technology',
    },
    {
      id: 'btc-fc-15',
      term: '51% Attack',
      definition: 'Theoretical attack where majority hashpower holder could double-spend or censor transactions.',
      example: 'Economically irrational due to cost exceeding potential gains.',
      category: 'Security',
    },
    {
      id: 'btc-fc-16',
      term: 'Nonce',
      definition: 'A 32-bit number miners increment to find a valid block hash below the difficulty target.',
      example: 'Miners try billions of nonces per second.',
      category: 'Mining',
    },
    {
      id: 'btc-fc-17',
      term: 'SegWit',
      definition: 'Segregated Witness - upgrade that moves signature data outside the transaction, fixing malleability and increasing capacity.',
      example: 'Native SegWit addresses start with bc1q...',
      category: 'Technology',
    },
    {
      id: 'btc-fc-18',
      term: 'BIP (Bitcoin Improvement Proposal)',
      definition: 'A design document for introducing new features or processes to Bitcoin.',
      example: 'BIP 39 defines mnemonic seed phrases.',
      category: 'Development',
    },
    {
      id: 'btc-fc-19',
      term: 'Coinbase Transaction',
      definition: 'The first transaction in every block, created by miners to claim block reward and fees.',
      example: 'Has no inputs, only outputs to miner addresses.',
      category: 'Mining',
    },
    {
      id: 'btc-fc-20',
      term: 'Nakamoto Consensus',
      definition: 'Bitcoin\'s consensus mechanism combining PoW, longest chain rule, and economic incentives.',
      example: 'First practical solution to the Byzantine Generals Problem.',
      category: 'Consensus',
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
      example: 'Pool prices can range from -$60 to $999.99/MWh.',
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
    {
      id: 'aeso-fc-11',
      term: 'Negative Price',
      definition: 'When pool price goes below $0, consumers are paid to use electricity due to oversupply.',
      example: 'Windy nights can see prices of -$30 to -$60/MWh.',
      category: 'Pricing',
    },
    {
      id: 'aeso-fc-12',
      term: 'Power Purchase Agreement (PPA)',
      definition: 'A contract between buyer and seller defining terms, price, and duration for electricity purchases.',
      example: 'Fixed PPAs lock in $60/MWh for 10 years.',
      category: 'Contracts',
    },
    {
      id: 'aeso-fc-13',
      term: 'Spinning Reserve',
      definition: 'Synchronized generation ready to increase output within 10 minutes of dispatch.',
      example: 'Spinning reserve providers receive standby payments.',
      category: 'Ancillary',
    },
    {
      id: 'aeso-fc-14',
      term: 'Supplemental Reserve',
      definition: 'Offline generation or interruptible load that can respond within 10 minutes.',
      example: 'Bitcoin miners can qualify as supplemental reserve.',
      category: 'Ancillary',
    },
    {
      id: 'aeso-fc-15',
      term: 'Regulating Reserve',
      definition: 'AGC-controlled resources providing automatic second-by-second frequency response.',
      example: 'Highest-paying reserve type at $15-40/MW/hour.',
      category: 'Ancillary',
    },
    {
      id: 'aeso-fc-16',
      term: 'EEA (Energy Emergency Alert)',
      definition: 'Warning levels indicating supply may not meet demand, with escalating severity.',
      example: 'EEA Level 3 means rolling blackouts are imminent.',
      category: 'Operations',
    },
    {
      id: 'aeso-fc-17',
      term: 'Curtailment',
      definition: 'Reducing electricity consumption in response to high prices or grid emergencies.',
      example: 'Curtailing at $200/MWh saves $4,800/hour per MW.',
      category: 'Operations',
    },
    {
      id: 'aeso-fc-18',
      term: 'Capacity Factor',
      definition: 'The ratio of actual energy produced to maximum possible production over a period.',
      example: 'Wind: 35%. Solar: 18%. Natural gas: 50-90%.',
      category: 'Generation',
    },
    {
      id: 'aeso-fc-19',
      term: 'Take-or-Pay',
      definition: 'A PPA clause requiring payment for contracted volume whether used or not.',
      example: 'Avoid strict take-or-pay if you need curtailment flexibility.',
      category: 'Contracts',
    },
    {
      id: 'aeso-fc-20',
      term: 'Block + Index PPA',
      definition: 'Hybrid contract with fixed price for base load and pool exposure for flexible capacity.',
      example: 'Base 20MW at $60/MWh + flex 10MW at pool price.',
      category: 'Contracts',
    },
    {
      id: 'aeso-fc-21',
      term: 'ATC (Available Transfer Capability)',
      definition: 'The remaining transmission capacity available for additional power transfers.',
      example: 'Low ATC can limit new interconnections.',
      category: 'Transmission',
    },
    {
      id: 'aeso-fc-22',
      term: 'DER (Distributed Energy Resource)',
      definition: 'Small-scale generation or storage connected at distribution level, not transmission.',
      example: 'Rooftop solar and batteries are common DERs.',
      category: 'Generation',
    },
    {
      id: 'aeso-fc-23',
      term: 'TIER (Technology Innovation and Emissions Reduction)',
      definition: 'Alberta\'s carbon pricing system for large industrial emitters.',
      example: 'Facilities emitting 100,000+ tonnes CO2/year are covered.',
      category: 'Regulation',
    },
    {
      id: 'aeso-fc-24',
      term: 'Peaking Generator',
      definition: 'Fast-start generators used only during highest demand periods, typically expensive.',
      example: 'Simple cycle gas turbines can start in 10-15 minutes.',
      category: 'Generation',
    },
    {
      id: 'aeso-fc-25',
      term: 'Dispatch',
      definition: 'The process of AESO directing generators to increase or decrease output.',
      example: 'Generators are dispatched based on their price offers.',
      category: 'Operations',
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
