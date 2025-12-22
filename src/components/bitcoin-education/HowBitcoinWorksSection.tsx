import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Send, Network, Pickaxe, Link2, Wallet, Key, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import ProgressiveDisclosure from '@/components/academy/ProgressiveDisclosure';
import SatoshiConverter from './SatoshiConverter';

const HowBitcoinWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Transaction Created',
      description: 'Alice wants to send Bitcoin to Bob. She uses her private key to sign a transaction from her wallet.',
      icon: Send,
      color: 'from-watt-bitcoin to-watt-bitcoin/70'
    },
    {
      number: '02',
      title: 'Network Propagation',
      description: 'The transaction is broadcast to the Bitcoin network, reaching thousands of nodes worldwide.',
      icon: Network,
      color: 'from-watt-trust to-watt-trust/70'
    },
    {
      number: '03',
      title: 'Mining & Verification',
      description: 'Miners compete to solve complex puzzles. The winner adds the transaction to a new block.',
      icon: Pickaxe,
      color: 'from-watt-success to-watt-success/70'
    },
    {
      number: '04',
      title: 'Block Added to Chain',
      description: 'The new block is cryptographically linked to previous blocks, making the record permanent.',
      icon: Link2,
      color: 'from-watt-bitcoin to-watt-bitcoin/70'
    }
  ];

  const concepts = [
    {
      title: 'Wallet',
      description: 'Software that stores your private keys and allows you to send/receive Bitcoin',
      icon: Wallet
    },
    {
      title: 'Private Key',
      description: 'A secret code that proves ownership and authorizes transactions (never share this!)',
      icon: Key
    },
    {
      title: 'Public Key',
      description: 'Your Bitcoin address that others use to send you Bitcoin (safe to share)',
      icon: Shield
    },
    {
      title: 'Hash',
      description: 'A unique digital fingerprint created from data, used to secure the blockchain',
      icon: CheckCircle2
    }
  ];

  // Realistic block data
  const blockData = [
    { height: 890001, hash: '0x7f2a...e4b1', txns: 2847 },
    { height: 890002, hash: '0x3c8b...f2d9', txns: 3102 },
    { height: 890003, hash: '0x9d4e...a7c3', txns: 2654 },
    { height: 890004, hash: '0x1b6f...d8e5', txns: 2918 },
    { height: 890005, hash: '0x5a2c...b1f7', txns: 3241 },
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <LearningObjectives
          objectives={[
            "Understand the 4-step transaction lifecycle: create, broadcast, mine, confirm",
            "Learn key concepts: wallets, private/public keys, and cryptographic hashes",
            "See how blocks are cryptographically linked to form an immutable chain"
          ]}
          estimatedTime="6 min"
          prerequisites={[
            { title: "What is Bitcoin", href: "/bitcoin#what-is-bitcoin" }
          ]}
        />
        
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <Network className="w-4 h-4 text-watt-trust" />
              <span className="text-sm font-medium text-watt-trust">Technology</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How Bitcoin Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding the technology behind Bitcoin: from transactions to the blockchain
            </p>
          </div>
        </ScrollReveal>

        {/* Transaction Flow with Animation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} direction="up" delay={index * 0.1}>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="bg-card rounded-2xl p-6 border border-border shadow-institutional h-full"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 400 }}
                    viewport={{ once: true }}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="text-xs font-bold text-primary mb-2">{step.number}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                  </motion.div>
                )}
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Blockchain Visual - Improved */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-watt-navy rounded-2xl p-6 md:p-8 mb-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center">The Blockchain</h3>
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
              {blockData.map((block, index) => (
                <motion.div 
                  key={block.height} 
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[120px] border border-white/20"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="text-xs text-watt-bitcoin mb-1">Block #{block.height}</div>
                    <div className="text-white font-mono text-xs truncate">{block.hash}</div>
                    <div className="text-white/60 text-xs mt-2">
                      {block.txns.toLocaleString()} txns
                    </div>
                  </motion.div>
                  {index < blockData.length - 1 && (
                    <motion.div 
                      className="mx-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Link2 className="w-4 h-4 text-watt-bitcoin" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="text-white/70 text-center text-sm mt-4">
              Each block contains a cryptographic hash of the previous block, creating an unbreakable chain
            </p>
          </div>
        </ScrollReveal>

        {/* Progressive Disclosure for Key Concepts */}
        <ScrollReveal direction="up" delay={0.5}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Key Concepts</h3>
          
          <ProgressiveDisclosure
            basicContent={
              <div className="grid md:grid-cols-4 gap-4">
                {concepts.map((concept) => (
                  <div key={concept.title} className="bg-muted rounded-xl p-5 border border-border">
                    <concept.icon className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-bold text-foreground mb-2">{concept.title}</h4>
                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                  </div>
                ))}
              </div>
            }
            intermediateContent={
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {concepts.map((concept) => (
                    <div key={concept.title} className="bg-muted rounded-xl p-5 border border-border">
                      <concept.icon className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-bold text-foreground mb-2">{concept.title}</h4>
                      <p className="text-sm text-muted-foreground">{concept.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Satoshi Converter */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-foreground mb-4 text-center">Try It: Satoshi Converter</h4>
                  <div className="max-w-md mx-auto">
                    <SatoshiConverter />
                  </div>
                </div>
              </div>
            }
            expertContent={
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {concepts.map((concept) => (
                    <div key={concept.title} className="bg-muted rounded-xl p-5 border border-border">
                      <concept.icon className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-bold text-foreground mb-2">{concept.title}</h4>
                      <p className="text-sm text-muted-foreground">{concept.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Satoshi Converter */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-foreground mb-4 text-center">Try It: Satoshi Converter</h4>
                  <div className="max-w-md mx-auto">
                    <SatoshiConverter />
                  </div>
                </div>
                
                {/* Technical Details */}
                <div className="bg-muted rounded-xl p-6 border border-border">
                  <h4 className="font-bold text-foreground mb-4">Technical Deep Dive</h4>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">SHA-256 Hashing:</span>
                      <p className="text-muted-foreground">Bitcoin uses the SHA-256 cryptographic hash function. Each block's hash is calculated from: previous block hash + merkle root + timestamp + difficulty target + nonce.</p>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Merkle Trees:</span>
                      <p className="text-muted-foreground">Transactions are organized in a binary hash tree (Merkle tree), allowing efficient verification. The merkle root summarizes all transactions in a single 32-byte hash.</p>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">ECDSA Signatures:</span>
                      <p className="text-muted-foreground">Bitcoin uses Elliptic Curve Digital Signature Algorithm (secp256k1 curve) for transaction authorization. Private keys are 256-bit numbers; public keys are derived via point multiplication.</p>
                    </div>
                    <div className="bg-card rounded-lg p-4 font-mono text-xs overflow-x-auto">
                      <code className="text-muted-foreground">
                        Block Header = Version + PrevHash + MerkleRoot + Time + Bits + Nonce<br/>
                        Target = 0x00000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF ÷ Difficulty
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            }
            labels={{
              basic: 'Overview',
              intermediate: 'Interactive',
              expert: 'Technical'
            }}
          />
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Bitcoin transactions are signed with private keys and broadcast to thousands of nodes",
            "Miners compete to add transactions to blocks, earning rewards for securing the network",
            "Each block is cryptographically linked to previous blocks, making the history immutable",
            "Your wallet holds your keys — 'not your keys, not your coins'"
          ]}
          proTip="A transaction becomes more secure with each new block added after it. Most consider 6 confirmations (~1 hour) as highly secure for large transactions."
          nextSteps={[
            { title: "Bitcoin Wallets", href: "/bitcoin#wallets" },
            { title: "Bitcoin Mining", href: "/bitcoin#mining" }
          ]}
        />
      </div>
    </section>
  );
};

export default HowBitcoinWorksSection;
