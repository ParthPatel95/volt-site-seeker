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
