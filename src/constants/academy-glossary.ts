import type { KeyTerm } from '@/components/academy/KeyTermsGlossary';

/**
 * Per-module key terms. Keep each module to ~5–10 essential, plain-English
 * definitions a novice needs to follow the lessons. Longer reference glossaries
 * live in src/components/academy/Glossary.tsx.
 */

export const BITCOIN_KEY_TERMS: KeyTerm[] = [
  {
    term: 'Bitcoin (BTC)',
    tag: 'Money',
    definition:
      'A digital money system that runs on a worldwide network of computers instead of being controlled by any bank or government.',
  },
  {
    term: 'Blockchain',
    tag: 'Network',
    definition:
      'A shared, append-only ledger of every Bitcoin transaction ever made. Think of it as a public spreadsheet that no single person can edit alone.',
  },
  {
    term: 'Node',
    tag: 'Network',
    definition:
      'A computer running Bitcoin software that keeps a full copy of the blockchain and checks every new transaction against the rules.',
  },
  {
    term: 'Miner',
    tag: 'Mining',
    definition:
      'A specialized computer (or the operator of one) that bundles new transactions into blocks and competes to add them to the blockchain in exchange for newly issued bitcoin.',
  },
  {
    term: 'Hashrate',
    tag: 'Mining',
    definition:
      'How many guesses per second a miner can make while trying to solve the puzzle that adds a block. More hashrate = more lottery tickets.',
  },
  {
    term: 'Block reward',
    tag: 'Economics',
    definition:
      'The new bitcoin a miner earns for adding a block. It halves roughly every four years — that event is called the "halving."',
  },
  {
    term: 'Wallet',
    tag: 'Custody',
    definition:
      'Software or hardware that stores the secret keys that prove you own bitcoin. The wallet doesn\'t hold coins — it holds the keys that move them.',
  },
  {
    term: 'Private key',
    tag: 'Security',
    definition:
      'A long secret number that authorizes spending. Whoever has the private key controls the coins. Lose it and the coins are stuck forever.',
  },
  {
    term: 'Mining pool',
    tag: 'Mining',
    definition:
      'A group of miners that combine hashrate so rewards arrive in steady, predictable payouts instead of rare jackpots.',
  },
];

export const DATACENTER_KEY_TERMS: KeyTerm[] = [
  { term: 'Datacenter', tag: 'Facility', definition: 'A purpose-built building (or container) that houses many computers, the power to run them, and the cooling to keep them from melting.' },
  { term: 'MW (Megawatt)', tag: 'Power', definition: 'One million watts. A 45MW site can run roughly 13,000 modern Bitcoin miners at full tilt.' },
  { term: 'PUE (Power Usage Effectiveness)', tag: 'Efficiency', definition: 'Total facility power ÷ power that reaches the miners. 1.0 is perfect; 1.05–1.15 is typical for a well-built Bitcoin site.' },
  { term: 'Substation', tag: 'Electrical', definition: 'The place where the utility hands you high-voltage electricity and you step it down to something your equipment can use.' },
  { term: 'Containment', tag: 'Cooling', definition: 'Physical barriers (curtains, doors, end caps) that stop hot exhaust air from mixing with cold intake air. The single biggest free win in air cooling.' },
  { term: 'Hot aisle / cold aisle', tag: 'Cooling', definition: 'The standard layout where miners face each other across a "cold" aisle (intake) and exhaust into a shared "hot" aisle.' },
  { term: 'Container / Modular', tag: 'Build', definition: 'A pre-fabricated mining pod, typically 1–3MW, that ships on a truck and is online in weeks instead of months.' },
  { term: 'Retrofit', tag: 'Build', definition: 'Converting an existing warehouse or industrial building into a mining facility — cheaper and faster than ground-up construction.' },
  { term: 'CapEx vs OpEx', tag: 'Finance', definition: 'CapEx = the upfront build cost. OpEx = the ongoing cost to run it (mostly power). Both decide whether the site makes money.' },
];

export const ELECTRICAL_KEY_TERMS: KeyTerm[] = [
  { term: 'Voltage (V)', tag: 'Basics', definition: 'Electrical "pressure" — how hard electricity is being pushed through a wire. Higher voltage = more push.' },
  { term: 'Current (A, amps)', tag: 'Basics', definition: 'How much electricity is actually flowing. Like water flow rate through a pipe.' },
  { term: 'Power (W, watts)', tag: 'Basics', definition: 'Voltage × current. The actual work being done — what you pay for and what runs the miners.' },
  { term: 'Three-phase power', tag: 'AC', definition: 'Industrial electricity delivered on three wires offset in time. Carries ~73% more power than single-phase using the same conductors.' },
  { term: 'Transformer', tag: 'Equipment', definition: 'A device that changes voltage up or down. The grid uses them to step 138kV down to the 480V or 415V miners actually use.' },
  { term: 'Switchgear', tag: 'Equipment', definition: 'The big metal cabinets full of breakers and switches that route power and shut things off when something goes wrong.' },
  { term: 'PDU (Power Distribution Unit)', tag: 'Equipment', definition: 'The "power strip" that delivers electricity to a row or rack of miners and meters how much each uses.' },
  { term: 'Arc flash', tag: 'Safety', definition: 'A violent electrical explosion that can occur when high-energy equipment faults. Reason electricians wear thick PPE near switchgear.' },
  { term: 'Grounding / bonding', tag: 'Safety', definition: 'Wiring all metal back to the earth so a fault current goes safely to ground instead of through a person or equipment.' },
  { term: '2N / N+1 redundancy', tag: 'Reliability', definition: 'N = what you need. N+1 = one spare. 2N = a full duplicate system. More redundancy = less downtime, more cost.' },
];

export const NETWORKING_KEY_TERMS: KeyTerm[] = [
  { term: 'Bandwidth', tag: 'Internet', definition: 'How much data your connection can carry per second. Mining is unusual: each miner only needs ~10–20 MB per day.' },
  { term: 'Latency', tag: 'Internet', definition: 'Round-trip delay to the mining pool. Every extra 100ms costs about 0.1% of your shares.' },
  { term: 'ISP (Internet Service Provider)', tag: 'Internet', definition: 'The company that brings internet to your site. Rural sites often need two — one primary, one backup.' },
  { term: 'Stratum / Stratum V2', tag: 'Mining', definition: 'The protocol miners use to talk to a pool. V2 adds encryption so attackers can\'t hijack your hashrate.' },
  { term: 'VLAN', tag: 'Network', definition: 'A "virtual" network inside one physical switch. Lets you keep miner traffic, management traffic, and office traffic separated.' },
  { term: 'Switch', tag: 'Hardware', definition: 'The box that connects all your miners together inside the building and to the uplink.' },
  { term: 'Firewall', tag: 'Security', definition: 'A filter between your network and the internet that blocks anything you didn\'t explicitly allow.' },
  { term: 'BGP / multi-homing', tag: 'Resilience', definition: 'Running two ISPs at once so traffic automatically fails over if one goes down. Critical above ~5MW.' },
  { term: 'Stale share', tag: 'Mining', definition: 'A share submitted to the pool too late to count. Caused by latency, packet loss, or pool problems — directly lowers revenue.' },
];

export const MINING_ECONOMICS_KEY_TERMS: KeyTerm[] = [
  {
    term: 'Hashrate (TH/s)',
    tag: 'Mining',
    definition:
      'A miner\'s speed measured in trillions of guesses per second. The more hashrate you have, the larger your share of mining rewards.',
  },
  {
    term: 'J/TH (efficiency)',
    tag: 'Hardware',
    definition:
      'Joules of electricity used per terahash. Lower is better — modern ASICs are around 15–25 J/TH and replace older 30–80 J/TH machines.',
  },
  {
    term: 'Difficulty',
    tag: 'Network',
    definition:
      'A number Bitcoin auto-adjusts every two weeks so blocks keep arriving every ~10 minutes even as more miners join. Rising difficulty shrinks each miner\'s share.',
  },
  {
    term: 'Halving',
    tag: 'Economics',
    definition:
      'Every 210,000 blocks (~4 years) the block reward drops by 50%. Miners who don\'t plan for it can wake up to half the revenue overnight.',
  },
  {
    term: 'Hash price',
    tag: 'Revenue',
    definition:
      'Daily revenue per terahash, usually quoted in $/TH/day. The single most useful number for comparing mining operations.',
  },
  {
    term: 'Break-even price',
    tag: 'Profitability',
    definition:
      'The bitcoin price (or electricity rate) at which revenue exactly equals operating costs. Below it you lose money on every block.',
  },
  {
    term: 'PPA (Power Purchase Agreement)',
    tag: 'Energy',
    definition:
      'A long-term electricity contract at a fixed price. Predictable power costs are the difference between a sustainable mine and a casino.',
  },
  {
    term: 'PUE (Power Usage Effectiveness)',
    tag: 'Operations',
    definition:
      'Total facility power divided by power that actually reaches the miners. 1.0 is perfect; 1.05–1.15 is typical for well-designed Bitcoin sites.',
  },
  {
    term: 'CapEx vs OpEx',
    tag: 'Finance',
    definition:
      'CapEx is the upfront spend (hardware, build-out). OpEx is the ongoing spend (power, labor, maintenance). Both drive ROI.',
  },
];

export const HYDRO_COOLING_KEY_TERMS: KeyTerm[] = [
  { term: 'Hydro cooling', tag: 'Cooling', definition: 'Using water (or a water/glycol mix) running through pipes and cold plates to carry heat away from miners — far more efficient than air.' },
  { term: 'Cold plate', tag: 'Hardware', definition: 'A flat metal block bolted directly to a hot chip. Coolant flows through it and absorbs the heat in a single pass.' },
  { term: 'CDU (Coolant Distribution Unit)', tag: 'Equipment', definition: 'The "pump room in a box" that pushes coolant around the loop, controls flow and temperature, and isolates the miners from the building loop.' },
  { term: 'Dry cooler', tag: 'Heat Rejection', definition: 'A big outdoor radiator with fans that dumps heat from the coolant into the air. Uses no water — ideal for cold climates like Alberta.' },
  { term: 'Cooling tower', tag: 'Heat Rejection', definition: 'A tower that evaporates a small amount of water to reject heat. More efficient than dry coolers in hot weather but consumes water.' },
  { term: 'Approach temperature', tag: 'Performance', definition: 'How close your coolant gets to the outside air temperature. A 5°C approach on a 10°C day means 15°C coolant — directly drives miner efficiency.' },
  { term: 'Glycol', tag: 'Fluid', definition: 'Antifreeze added to water to keep the loop from freezing in winter. Typical mix is 30–40% propylene glycol for Canadian sites.' },
  { term: 'Hydro container', tag: 'Build', definition: 'A pre-plumbed mining pod with cold plates, manifolds, and a CDU built in. Just connect power, coolant, and network.' },
  { term: 'Waste heat recovery', tag: 'Revenue', definition: 'Selling or using the warm water coming out of the miners — for greenhouses, district heating, fish farms, or drying crops.' },
];

export const IMMERSION_COOLING_KEY_TERMS: KeyTerm[] = [
  { term: 'Immersion cooling', tag: 'Cooling', definition: 'Submerging miners directly in a special non-conductive liquid that absorbs heat. The fluid is "electrically invisible" — your motherboard runs underwater without shorting.' },
  { term: 'Single-phase immersion', tag: 'Type', definition: 'The fluid stays liquid the whole time. Pumps push it through a heat exchanger. Simpler and more common.' },
  { term: 'Two-phase immersion', tag: 'Type', definition: 'The fluid actually boils on the chips and condenses on a coil above. Extremely efficient but uses expensive engineered fluids.' },
  { term: 'Dielectric fluid', tag: 'Fluid', definition: 'A liquid that doesn\'t conduct electricity. Common types: synthetic hydrocarbons, mineral oil, or engineered fluorocarbons.' },
  { term: 'Tank', tag: 'Equipment', definition: 'The sealed bath that holds the fluid and miners. Comes in horizontal (rack-style) or vertical configurations.' },
  { term: 'Hardware prep', tag: 'Process', definition: 'Removing fans, replacing thermal paste, and stripping stickers before submerging. Skipping this is the #1 cause of immersion failures.' },
  { term: 'Overclocking', tag: 'Performance', definition: 'Pushing miners beyond factory clock speeds. Immersion makes this safe because heat is removed instantly — typical 15–30% hashrate gain.' },
  { term: 'Fluid degradation', tag: 'Maintenance', definition: 'Over time the fluid picks up contaminants and breaks down. Quality fluids last 5–10 years; cheap ones may need replacement in 2–3.' },
  { term: 'PUE (immersion)', tag: 'Efficiency', definition: 'Immersion typically achieves PUE of 1.02–1.05 vs 1.10–1.20 for air. That extra 5–15% goes straight to mining.' },
];

export const OPERATIONS_KEY_TERMS: KeyTerm[] = [
  { term: 'NOC (Network Operations Center)', tag: 'Monitoring', definition: 'The 24/7 control room that watches every miner, alarm, and KPI. On a 45MW site this is one or two people staring at dashboards.' },
  { term: 'KPI', tag: 'Metrics', definition: 'Key Performance Indicator — the few numbers that actually decide whether the site is healthy: uptime %, hashrate %, J/TH, $/MWh.' },
  { term: 'Uptime', tag: 'Metrics', definition: 'Percent of time miners are actually hashing. Industry-good is >98%; <95% means something is structurally wrong.' },
  { term: 'MTTR (Mean Time To Repair)', tag: 'Maintenance', definition: 'Average minutes from a miner failing to it being back online. Great teams hit <30 min on common faults.' },
  { term: 'Curtailment', tag: 'Operations', definition: 'Voluntarily turning miners off when power is too expensive or the grid asks you to. A revenue strategy, not a problem.' },
  { term: 'Firmware', tag: 'Software', definition: 'The miner\'s onboard software. Custom firmware (Braiins, LuxOS, Vnish) can lift efficiency 5–15% over stock.' },
  { term: 'Stale share rate', tag: 'Network', definition: 'Percentage of work submitted too late to count. >1% usually means a network or pool problem worth fixing today.' },
  { term: 'Preventive maintenance', tag: 'Maintenance', definition: 'Scheduled cleaning, fan swaps, and inspections done <em>before</em> failure. Cheaper than firefighting broken miners.' },
  { term: 'Runbook', tag: 'Process', definition: 'A written, step-by-step procedure for handling an incident. The difference between a 10-minute outage and a 4-hour one.' },
];

export const ENGINEERING_PERMITTING_KEY_TERMS: KeyTerm[] = [
  { term: 'AESO', tag: 'Alberta', definition: 'Alberta Electric System Operator — the entity that runs the provincial grid and approves any large new connection.' },
  { term: 'AUC', tag: 'Alberta', definition: 'Alberta Utilities Commission — the regulator that ultimately approves large electrical infrastructure (substations, transmission).' },
  { term: 'Interconnection study', tag: 'Process', definition: 'A formal AESO/utility analysis to confirm the grid can accept your load. Required for anything above ~5MW; takes 12–24 months.' },
  { term: 'Development permit', tag: 'Permits', definition: 'Municipal approval to use the land for your intended purpose. The first permit you need from the county or city.' },
  { term: 'Building permit', tag: 'Permits', definition: 'Approval that your structure meets the building code. Comes after the development permit.' },
  { term: 'CEC (Canadian Electrical Code)', tag: 'Standards', definition: 'The national rulebook for how electrical work must be installed. Every wire, breaker, and ground in your facility is judged against it.' },
  { term: 'PEng / Stamped drawings', tag: 'Engineering', definition: 'Drawings reviewed and sealed by a Professional Engineer — legally required for any meaningful electrical or structural design.' },
  { term: 'Single-Line Diagram (SLD)', tag: 'Engineering', definition: 'The "subway map" of the electrical system showing every transformer, breaker, and bus on one page.' },
  { term: 'Environmental review', tag: 'Permits', definition: 'Assessment of impact on land, water, wildlife, and noise. Scope varies wildly by site (greenfield vs brownfield).' },
];

export const NOISE_KEY_TERMS: KeyTerm[] = [
  { term: 'dB (decibel)', tag: 'Basics', definition: 'A logarithmic measure of loudness. +10 dB = 10× the sound energy and roughly twice as loud to your ear.' },
  { term: 'dBA', tag: 'Basics', definition: 'Decibels weighted to match human hearing. Almost all noise regulations are written in dBA.' },
  { term: 'Ambient noise', tag: 'Measurement', definition: 'The background sound level at a property line before your facility exists. Regulations usually limit how much you can add to it.' },
  { term: 'Receptor', tag: 'Regulation', definition: 'The nearest neighbour, house, or sensitive land use that your noise impacts. Distances to receptors drive the whole design.' },
  { term: 'Inverse-square law', tag: 'Physics', definition: 'Sound drops about 6 dB every time you double the distance from a point source. Doubling setback is one of the cheapest mitigations.' },
  { term: 'Sound wall / barrier', tag: 'Mitigation', definition: 'A solid wall placed between miners and a receptor. A well-built barrier can cut perceived noise by 10–15 dB.' },
  { term: 'Cumulative noise', tag: 'Math', definition: 'Adding multiple sources together. Two identical 80 dB sources = 83 dB, not 160 dB. Logarithms matter.' },
  { term: 'Tonal noise', tag: 'Regulation', definition: 'A noise with a clear pitch (like a fan whine). Regulators often penalize it with a +5 dB adjustment because humans find it more annoying.' },
  { term: 'Noise model', tag: 'Process', definition: 'Software simulation (CadnaA, SoundPLAN) that predicts dB levels at each receptor before construction. Required for most permits.' },
];

export const TAXES_INSURANCE_KEY_TERMS: KeyTerm[] = [
  { term: 'CapEx depreciation', tag: 'Tax', definition: 'Spreading the cost of buying miners and infrastructure across multiple tax years instead of expensing it all at once.' },
  { term: 'CCA (Capital Cost Allowance)', tag: 'Canada Tax', definition: 'Canada\'s version of depreciation. ASIC miners typically fall into Class 50 (55% declining balance).' },
  { term: 'GST/HST input tax credits', tag: 'Canada Tax', definition: 'Recovering the sales tax you paid on equipment purchases. Big number on a $50M build.' },
  { term: 'SR&ED', tag: 'Canada Tax', definition: 'Scientific Research & Experimental Development credits. Some firmware and cooling R&D may qualify — talk to a specialist.' },
  { term: 'Mined coin valuation', tag: 'Crypto Tax', definition: 'In Canada and the US, freshly mined BTC is income at the fair market value the moment it\'s received — not when you sell it.' },
  { term: 'Property insurance', tag: 'Insurance', definition: 'Covers physical damage to building, transformers, and miners. Usually mandatory for any lender.' },
  { term: 'Business interruption', tag: 'Insurance', definition: 'Replaces lost revenue when an insured event takes you offline. Critical because a 2-week outage on 45MW = millions in lost mining income.' },
  { term: 'D&O insurance', tag: 'Insurance', definition: 'Directors & Officers — protects executives personally if the company is sued.' },
  { term: 'Cyber insurance', tag: 'Insurance', definition: 'Covers ransomware, wallet theft, and data breaches. Underwriters will demand 2FA, segmented networks, and offline keys.' },
];
