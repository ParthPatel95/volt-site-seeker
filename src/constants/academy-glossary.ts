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
