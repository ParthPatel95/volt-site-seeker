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

// Mining Economics Flashcards
export const MINING_ECONOMICS_FLASHCARDS: FlashcardDeck = {
  deckId: 'mining-economics-terms',
  title: 'Mining Economics',
  description: 'Key financial terms for Bitcoin mining profitability analysis',
  cards: [
    { id: 'me-fc-1', term: 'Hash Price', definition: 'Revenue earned per unit of hash rate, typically expressed as USD/TH/day.', example: 'Hash price of $0.08/TH/day means each terahash earns 8 cents daily.', category: 'Revenue' },
    { id: 'me-fc-2', term: 'Break-Even Electricity Price', definition: 'Maximum power cost at which mining remains profitable given current BTC price and difficulty.', example: 'If break-even is $0.07/kWh and you pay $0.04/kWh, your margin is $0.03/kWh.', category: 'Profitability' },
    { id: 'me-fc-3', term: 'All-In Sustaining Cost (AISC)', definition: 'Total cost to produce 1 BTC including electricity, hosting, depreciation, staff, and overhead.', example: 'An AISC of $35,000/BTC means you need BTC > $35K to profit.', category: 'Cost' },
    { id: 'me-fc-4', term: 'Difficulty Adjustment', definition: 'Automatic recalibration every 2,016 blocks to maintain ~10 min block times. Rising difficulty reduces per-miner revenue.', example: 'A 10% difficulty increase means 10% less BTC mined with the same hardware.', category: 'Network' },
    { id: 'me-fc-5', term: 'Payback Period', definition: 'Time required for mining revenue to recoup the initial hardware investment.', example: 'A $5,000 miner earning $400/month has a ~12.5-month payback.', category: 'Investment' },
    { id: 'me-fc-6', term: 'Curtailment', definition: 'Voluntarily reducing mining load during high electricity prices to avoid losses.', example: 'Shutting down when pool price exceeds $150/MWh in Alberta.', category: 'Strategy' },
    { id: 'me-fc-7', term: 'Hash Rate', definition: 'The total computational power a miner or network contributes, measured in TH/s, PH/s, or EH/s.', example: 'Bitcoin network: ~700 EH/s (2026). Single S21: 200 TH/s.', category: 'Metrics' },
    { id: 'me-fc-8', term: 'Block Subsidy', definition: 'Newly minted BTC awarded to the miner who finds a valid block. Halves every 210,000 blocks.', example: 'Post-2024: 3.125 BTC per block (~$200K at $65K/BTC).', category: 'Revenue' },
    { id: 'me-fc-9', term: 'Transaction Fees', definition: 'Fees paid by users to include transactions in a block, an increasingly important revenue source post-halving.', example: 'Transaction fees can spike to 20-50% of block reward during high-demand periods.', category: 'Revenue' },
    { id: 'me-fc-10', term: 'Power Cost Ratio', definition: 'Percentage of mining revenue consumed by electricity costs, the key operating margin indicator.', example: 'At $0.05/kWh a ratio of 60% is typical; above 80% signals danger.', category: 'Profitability' },
    { id: 'me-fc-11', term: 'Mining Pool', definition: 'A group of miners combining hashrate to find blocks more frequently and sharing rewards proportionally.', example: 'Pools charge 1-3% fees. Larger pools find blocks more regularly.', category: 'Operations' },
    { id: 'me-fc-12', term: 'Hosting Fee', definition: 'All-in cost charged by hosting providers covering power, cooling, space, and management per kWh or per TH.', example: 'Typical hosting: $0.065-0.085/kWh all-in including management.', category: 'Cost' },
  ],
};

// Datacenter / Mining Infrastructure Flashcards
export const DATACENTER_FLASHCARDS: FlashcardDeck = {
  deckId: 'datacenter-terms',
  title: 'Mining Infrastructure',
  description: 'Essential datacenter and facility design terminology',
  cards: [
    { id: 'dc-fc-1', term: 'PUE (Power Usage Effectiveness)', definition: 'Ratio of total facility power to IT equipment power. Lower is better.', example: 'PUE 1.1 means 10% overhead. Air-cooled: ~1.3, Immersion: ~1.03.', category: 'Efficiency' },
    { id: 'dc-fc-2', term: 'Hot/Cold Aisle Containment', definition: 'Physical separation of hot exhaust and cold intake air streams for efficient cooling.', example: 'Prevents hot air recirculation, improving cooling efficiency 20-40%.', category: 'Cooling' },
    { id: 'dc-fc-3', term: 'Free-Air Cooling', definition: 'Using outside ambient air for cooling instead of mechanical refrigeration.', example: 'In Alberta, viable 8-10 months/year when ambient < 25°C.', category: 'Cooling' },
    { id: 'dc-fc-4', term: 'Power Density (kW/rack)', definition: 'Amount of power consumed per rack or unit area. Mining is extremely dense.', example: 'Mining: 30-80 kW/rack vs traditional DC: 5-15 kW/rack.', category: 'Design' },
    { id: 'dc-fc-5', term: 'Containerized Mining', definition: 'Pre-fabricated shipping containers outfitted with miners, cooling, and electrical systems.', example: 'Deploy 1MW in a 40ft container in weeks vs months for a building.', category: 'Infrastructure' },
    { id: 'dc-fc-6', term: 'Uptime / Availability', definition: 'Percentage of time the facility is operational and mining.', example: '99% uptime = ~87.6 hours downtime/year. 95% = ~438 hours.', category: 'Operations' },
    { id: 'dc-fc-7', term: 'Redundancy (N+1)', definition: 'Having backup capacity beyond minimum requirements for reliability.', example: 'N+1 cooling: 3 units where only 2 are needed, so 1 can fail.', category: 'Reliability' },
    { id: 'dc-fc-8', term: 'Environmental Monitoring', definition: 'Sensors tracking temperature, humidity, airflow, and water leaks throughout the facility.', example: 'Alerts triggered if ambient temp exceeds 35°C or humidity > 80%.', category: 'Monitoring' },
  ],
};

// Hydro Cooling Flashcards
export const HYDRO_COOLING_FLASHCARDS: FlashcardDeck = {
  deckId: 'hydro-cooling-terms',
  title: 'Hydro Cooling Systems',
  description: 'Terminology for water-based cooling in mining operations',
  cards: [
    { id: 'hydro-fc-1', term: 'Rear-Door Heat Exchanger (RDHx)', definition: 'A liquid-cooled heat exchanger mounted on the back of a rack/container to capture exhaust heat.', example: 'Removes 60-80% of heat at the rack before it enters the room.', category: 'Equipment' },
    { id: 'hydro-fc-2', term: 'Dry Cooler', definition: 'Air-to-water heat exchanger that rejects heat to ambient air without water evaporation.', example: 'No water consumption. Effective when ambient < return water temp.', category: 'Equipment' },
    { id: 'hydro-fc-3', term: 'Closed-Loop System', definition: 'Cooling circuit that recirculates the same treated water without evaporative losses.', example: 'Minimal water makeup needed. Reduces contamination and treatment costs.', category: 'Design' },
    { id: 'hydro-fc-4', term: 'Glycol', definition: 'Antifreeze additive (propylene or ethylene glycol) mixed with water to prevent freezing.', example: '30% glycol mix protects to about -15°C. Required in cold climates.', category: 'Fluids' },
    { id: 'hydro-fc-5', term: 'Delta-T (ΔT)', definition: 'Temperature difference between supply and return coolant, indicating heat absorbed.', example: 'Supply 20°C, return 35°C = ΔT of 15°C. Higher ΔT = more heat removed.', category: 'Metrics' },
    { id: 'hydro-fc-6', term: 'Flow Rate (GPM/LPM)', definition: 'Volume of coolant circulating per unit time through the cooling system.', example: 'Typical: 10-20 GPM per container. Must match heat load for target ΔT.', category: 'Metrics' },
    { id: 'hydro-fc-7', term: 'Waste Heat Recovery', definition: 'Capturing rejected heat from mining for useful purposes like space heating or agriculture.', example: '1 MW of mining produces ~3.4 million BTU/hr of recoverable heat.', category: 'Efficiency' },
    { id: 'hydro-fc-8', term: 'Water Treatment', definition: 'Chemical and filtration processes to prevent scaling, corrosion, and biological growth.', example: 'pH control, biocide, corrosion inhibitor, and filtration.', category: 'Maintenance' },
  ],
};

// Immersion Cooling Flashcards
export const IMMERSION_COOLING_FLASHCARDS: FlashcardDeck = {
  deckId: 'immersion-cooling-terms',
  title: 'Immersion Cooling',
  description: 'Key terms for understanding immersion cooling technology',
  cards: [
    { id: 'imm-fc-1', term: 'Dielectric Fluid', definition: 'Electrically non-conductive liquid used to directly cool electronics by submersion.', example: 'Mineral oil, synthetic hydrocarbons, or fluorocarbon-based fluids.', category: 'Fluids' },
    { id: 'imm-fc-2', term: 'Single-Phase Immersion', definition: 'Cooling where fluid remains liquid throughout, absorbing heat via convection.', example: 'Uses mineral oil or engineered hydrocarbons. Boiling point >200°C.', category: 'Technology' },
    { id: 'imm-fc-3', term: 'Two-Phase Immersion', definition: 'Cooling where fluid boils at chip surface, using phase change for enhanced heat transfer.', example: 'Fluid boils at 49-60°C. Vapor condenses on a coil and returns to tank.', category: 'Technology' },
    { id: 'imm-fc-4', term: 'Overclocking', definition: 'Running hardware at higher-than-rated speeds, enabled by immersion\'s superior cooling.', example: '200 TH/s miner overclocked to 250 TH/s = 25% more hash rate.', category: 'Performance' },
    { id: 'imm-fc-5', term: 'Tank System', definition: 'The enclosure holding dielectric fluid and submerged mining hardware.', example: 'Typical tank holds 10-20 miners with integrated fluid circulation.', category: 'Equipment' },
    { id: 'imm-fc-6', term: 'Fluid Degradation', definition: 'Gradual breakdown of dielectric fluid properties over time from heat and contaminants.', example: 'Monitor viscosity, dielectric strength, and acidity quarterly.', category: 'Maintenance' },
    { id: 'imm-fc-7', term: 'Heat Transfer Coefficient', definition: 'Rate at which heat transfers from chip to fluid, measured in W/m²·K.', example: 'Immersion: 500-3000 W/m²·K vs air: 25-100 W/m²·K.', category: 'Physics' },
    { id: 'imm-fc-8', term: 'PUE in Immersion', definition: 'Immersion cooling achieves near-perfect PUE by eliminating fans and reducing cooling energy.', example: 'Immersion PUE: 1.02-1.05 vs air-cooled: 1.2-1.4.', category: 'Efficiency' },
  ],
};

// Operations & Maintenance Flashcards
export const OPERATIONS_FLASHCARDS: FlashcardDeck = {
  deckId: 'operations-terms',
  title: 'Operations & Maintenance',
  description: 'Key terms for running and maintaining mining facilities',
  cards: [
    { id: 'ops-fc-1', term: 'MTBF (Mean Time Between Failures)', definition: 'Average time a device operates before failure. Higher is better.', example: 'ASIC fans: ~30,000 hours MTBF. PSUs: ~50,000 hours.', category: 'Reliability' },
    { id: 'ops-fc-2', term: 'MTTR (Mean Time To Repair)', definition: 'Average time to diagnose and fix a failed device.', example: 'Target: <4 hours for miner swap. <1 hour for network issues.', category: 'Reliability' },
    { id: 'ops-fc-3', term: 'Predictive Maintenance', definition: 'Using sensor data and analytics to predict equipment failures before they occur.', example: 'Temperature trending up on a hash board may indicate impending failure.', category: 'Strategy' },
    { id: 'ops-fc-4', term: 'Stale Share', definition: 'Mining work submitted after the pool has moved to a new job, resulting in wasted computation.', example: 'Stale rate >2% indicates network latency or pool connectivity issues.', category: 'Mining' },
    { id: 'ops-fc-5', term: 'Firmware Management', definition: 'Controlling the software running on ASIC miners for performance, security, and features.', example: 'Custom firmware like Braiins OS+ can improve efficiency 5-20%.', category: 'Software' },
    { id: 'ops-fc-6', term: 'NOC (Network Operations Center)', definition: 'Centralized facility for monitoring and managing all mining operations.', example: 'NOC dashboards show real-time hash rate, temps, and alerts for all sites.', category: 'Operations' },
    { id: 'ops-fc-7', term: 'Thermal Throttling', definition: 'Automatic reduction of hash rate when chip temperatures exceed safe thresholds.', example: 'Miner reduces from 200 TH/s to 150 TH/s when chips hit 95°C.', category: 'Hardware' },
    { id: 'ops-fc-8', term: 'KPI Dashboard', definition: 'Key Performance Indicator display showing critical operational metrics.', example: 'Tracks uptime %, hash rate efficiency, power consumption, and revenue.', category: 'Management' },
  ],
};

// Noise Management Flashcards
export const NOISE_FLASHCARDS: FlashcardDeck = {
  deckId: 'noise-terms',
  title: 'Noise Management',
  description: 'Acoustics and noise control terminology for mining facilities',
  cards: [
    { id: 'noise-fc-1', term: 'dBA (A-weighted Decibels)', definition: 'Sound pressure level adjusted to match human hearing sensitivity. Standard for regulations.', example: 'Conversation: ~60 dBA. Mining facility at 1m: ~85-95 dBA.', category: 'Measurement' },
    { id: 'noise-fc-2', term: 'Inverse Square Law', definition: 'Sound intensity decreases by 6 dB for every doubling of distance from the source.', example: '90 dB at 10m → 84 dB at 20m → 78 dB at 40m.', category: 'Physics' },
    { id: 'noise-fc-3', term: 'PSL (Permissible Sound Level)', definition: 'Maximum allowed noise at a receptor point, defined by Alberta regulations.', example: 'Rural residential: 40 dBA nighttime, 50 dBA daytime.', category: 'Regulations' },
    { id: 'noise-fc-4', term: 'Sound Barrier / Wall', definition: 'Physical structure blocking direct sound path between source and receptor.', example: 'Earth berms or concrete walls can achieve 10-15 dB reduction.', category: 'Mitigation' },
    { id: 'noise-fc-5', term: 'Acoustic Louvre', definition: 'Ventilation opening with sound-absorbing baffles allowing airflow while reducing noise.', example: 'Provides 10-20 dB noise reduction while maintaining cooling airflow.', category: 'Equipment' },
    { id: 'noise-fc-6', term: 'NIA (Noise Impact Assessment)', definition: 'Engineering study predicting facility noise levels at nearby receptor locations.', example: 'Required for permitting. Uses acoustic modeling software.', category: 'Compliance' },
    { id: 'noise-fc-7', term: 'Setback Distance', definition: 'Minimum distance between a noise source and property boundary or receptor.', example: 'The 45MW facility uses a 1.7km setback from nearest residence.', category: 'Design' },
    { id: 'noise-fc-8', term: 'Octave Band Analysis', definition: 'Breaking sound into frequency bands to identify dominant noise frequencies for targeted mitigation.', example: 'Miner fans peak at 1-4 kHz. Barriers are more effective at high frequencies.', category: 'Analysis' },
  ],
};

// Taxes & Insurance Flashcards
export const TAXES_INSURANCE_FLASHCARDS: FlashcardDeck = {
  deckId: 'taxes-insurance-terms',
  title: 'Taxes & Insurance',
  description: 'Tax treatment and insurance terminology for mining operations',
  cards: [
    { id: 'tax-fc-1', term: 'CCA (Capital Cost Allowance)', definition: 'Canadian tax depreciation system allowing businesses to deduct asset costs over time.', example: 'ASIC miners: Class 50 at 55% declining balance per year.', category: 'Tax' },
    { id: 'tax-fc-2', term: 'Business Interruption Insurance', definition: 'Coverage for lost revenue when insured events cause operational downtime.', example: 'Covers lost mining income during repairs after a fire or flood.', category: 'Insurance' },
    { id: 'tax-fc-3', term: 'Replacement Cost vs ACV', definition: 'Replacement cost pays to buy new; Actual Cash Value deducts depreciation.', example: 'A 2-year-old miner worth $2K (ACV) costs $5K to replace (RC).', category: 'Insurance' },
    { id: 'tax-fc-4', term: 'GST/HST Input Tax Credits', definition: 'Refund of GST/HST paid on business expenses when the business collects GST/HST.', example: 'Claim back GST on electricity, equipment, and maintenance costs.', category: 'Tax' },
    { id: 'tax-fc-5', term: 'Fair Market Value (FMV)', definition: 'Price at which mined crypto is valued for tax purposes at the time of receipt.', example: 'Mine 0.1 BTC when price is $65K = $6,500 income.', category: 'Tax' },
    { id: 'tax-fc-6', term: 'Directors & Officers (D&O) Insurance', definition: 'Coverage protecting company leaders from personal liability in business decisions.', example: 'Protects against shareholder lawsuits over operational losses.', category: 'Insurance' },
    { id: 'tax-fc-7', term: 'SR&ED Tax Credit', definition: 'Scientific Research & Experimental Development credit for qualifying R&D activities.', example: 'Custom cooling R&D or firmware optimization may qualify for 15-35% credits.', category: 'Tax' },
    { id: 'tax-fc-8', term: 'Property Tax Assessment', definition: 'Municipal valuation of facility and equipment for annual property tax calculation.', example: 'Mining equipment may be assessed as personal property, varying by jurisdiction.', category: 'Tax' },
  ],
};

// Engineering & Permitting Flashcards
export const ENGINEERING_PERMITTING_FLASHCARDS: FlashcardDeck = {
  deckId: 'engineering-permitting-terms',
  title: 'Engineering & Permitting',
  description: 'Regulatory and engineering terms for mining facility development',
  cards: [
    { id: 'ep-fc-1', term: 'AUC (Alberta Utilities Commission)', definition: 'Provincial regulator overseeing utilities, approving power plants and large industrial loads.', example: 'AUC approval required for loads >10MW or any generation facility.', category: 'Regulatory' },
    { id: 'ep-fc-2', term: 'System Impact Study', definition: 'AESO assessment of how a new connection affects grid stability and required upgrades.', example: 'May identify need for transformer upgrades or line reinforcement.', category: 'Grid' },
    { id: 'ep-fc-3', term: 'Development Permit (DP)', definition: 'Municipal approval confirming proposed use aligns with zoning and land use bylaws.', example: 'Required before building permit. Includes setback and noise conditions.', category: 'Municipal' },
    { id: 'ep-fc-4', term: 'Building Permit', definition: 'Authorization to construct based on approved engineered drawings meeting safety codes.', example: 'Requires stamped electrical, structural, and mechanical drawings.', category: 'Municipal' },
    { id: 'ep-fc-5', term: 'Environmental Impact Assessment (EIA)', definition: 'Study evaluating potential environmental effects of a proposed project.', example: 'May be required for noise, water use, or emissions depending on scale.', category: 'Environmental' },
    { id: 'ep-fc-6', term: 'Customer Contribution', definition: 'The portion of transmission upgrade costs paid by the connecting customer.', example: 'Customer pays for dedicated infrastructure; shared costs are socialized.', category: 'Financial' },
    { id: 'ep-fc-7', term: 'Stamped Drawings', definition: 'Engineering drawings bearing a licensed professional engineer\'s seal of approval.', example: 'Required for electrical single-line, structural, and site plans.', category: 'Engineering' },
    { id: 'ep-fc-8', term: 'DTS (Demand Transmission Service)', definition: 'AESO transmission service for large loads connecting directly to the transmission grid.', example: 'Rate 65 DTS is typical for mining loads >5MW.', category: 'Grid' },
  ],
};

// Networking Flashcards
export const NETWORKING_FLASHCARDS: FlashcardDeck = {
  deckId: 'networking-terms',
  title: 'Networking for Mining',
  description: 'Network infrastructure terminology for mining operations',
  cards: [
    { id: 'net-fc-1', term: 'Stratum Protocol', definition: 'Communication protocol between miners and pools for work distribution and share submission.', example: 'Stratum V2 adds encryption and allows miners to select transactions.', category: 'Protocol' },
    { id: 'net-fc-2', term: 'VLAN (Virtual LAN)', definition: 'Logical network segmentation isolating traffic types for security and performance.', example: 'Separate VLANs for mining, management, monitoring, and guest access.', category: 'Security' },
    { id: 'net-fc-3', term: 'BGP (Border Gateway Protocol)', definition: 'Routing protocol enabling multi-homed internet with automatic ISP failover.', example: 'Advertise your IP block via two ISPs for seamless redundancy.', category: 'Routing' },
    { id: 'net-fc-4', term: 'Latency', definition: 'Time delay for data to travel between miner and pool, affecting share acceptance.', example: '<50ms to pool = good. >200ms = excessive stale shares.', category: 'Performance' },
    { id: 'net-fc-5', term: 'Stale Share Rate', definition: 'Percentage of submitted work that the pool rejects because it arrived too late.', example: 'Target <1%. Higher rates indicate network or pool connectivity issues.', category: 'Mining' },
    { id: 'net-fc-6', term: 'PoE (Power over Ethernet)', definition: 'Delivering power through Ethernet cables to network devices like APs and cameras.', example: 'Eliminates separate power cables for IP cameras and access points.', category: 'Infrastructure' },
    { id: 'net-fc-7', term: 'Firewall Rules', definition: 'Network security policies controlling which traffic is allowed or blocked.', example: 'Allow only Stratum port (3333/4444) outbound to known pool IPs.', category: 'Security' },
    { id: 'net-fc-8', term: 'IPMI/BMC', definition: 'Out-of-band management interfaces for remote server/miner control.', example: 'Allows remote reboot and configuration even when OS is unresponsive.', category: 'Management' },
  ],
};

// Strategic Operations Flashcards
export const STRATEGIC_OPERATIONS_FLASHCARDS: FlashcardDeck = {
  deckId: 'strategic-ops-terms',
  title: 'Strategic Operations',
  description: 'Strategic planning and business terminology for mining operations',
  cards: [
    { id: 'strat-fc-1', term: 'Behind-the-Meter', definition: 'Connecting mining load directly to a power source before the utility meter, avoiding T&D charges.', example: 'Co-locating at a natural gas wellsite or solar farm.', category: 'Strategy' },
    { id: 'strat-fc-2', term: 'Site Scoring Matrix', definition: 'Weighted evaluation framework for objectively comparing potential mining locations.', example: 'Weight: Power cost (30%), Reliability (20%), Permits (15%), Climate (15%).', category: 'Analysis' },
    { id: 'strat-fc-3', term: 'Demand Response', definition: 'Curtailing mining load when grid operator requests, often earning revenue or credits.', example: 'Reduce 10MW during grid stress events, earning $50-200/MWh credits.', category: 'Revenue' },
    { id: 'strat-fc-4', term: 'PPA (Power Purchase Agreement)', definition: 'Long-term contract to buy electricity at agreed-upon terms and price.', example: 'Fixed 5-year PPA at $0.04/kWh provides cost certainty.', category: 'Contracts' },
    { id: 'strat-fc-5', term: 'IRR (Internal Rate of Return)', definition: 'Annualized return rate that makes the NPV of all cash flows equal to zero.', example: 'Mining projects typically target 30-50% IRR.', category: 'Finance' },
    { id: 'strat-fc-6', term: 'Hashrate Hedging', definition: 'Using financial derivatives to lock in mining revenue regardless of BTC price/difficulty.', example: 'Sell hashrate forward contracts on platforms like Luxor.', category: 'Risk' },
    { id: 'strat-fc-7', term: 'Multi-Site Diversification', definition: 'Operating across multiple geographic locations to reduce concentration risk.', example: 'Sites in Alberta, Texas, and Paraguay for power/regulatory diversity.', category: 'Strategy' },
    { id: 'strat-fc-8', term: 'Exit Strategy', definition: 'Planned approach for liquidating or transitioning a mining operation.', example: 'Options: sell to acquirer, convert to HPC/AI datacenter, or IPO.', category: 'Business' },
  ],
};
