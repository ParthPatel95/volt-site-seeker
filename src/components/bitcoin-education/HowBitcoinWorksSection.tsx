import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Send, Network, Pickaxe, Link2, Wallet, Key, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
              <Network className="w-4 h-4 text-watt-trust" />
              <span className="text-sm font-medium text-watt-trust">Technology</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-4">
              How Bitcoin Works
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Understanding the technology behind Bitcoin: from transactions to the blockchain
            </p>
          </div>
        </ScrollReveal>

        {/* Transaction Flow */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} direction="up" delay={index * 0.1}>
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 border border-watt-navy/10 shadow-institutional h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold text-watt-bitcoin mb-2">{step.number}</div>
                  <h3 className="text-lg font-bold text-watt-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-watt-navy/70">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-watt-navy/30" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Blockchain Visual */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-watt-navy rounded-2xl p-6 md:p-8 mb-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center">The Blockchain</h3>
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((block, index) => (
                <div key={block} className="flex items-center">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 min-w-[120px] border border-white/20">
                    <div className="text-xs text-watt-bitcoin mb-1">Block #{890000 + block}</div>
                    <div className="text-white font-mono text-xs truncate">0x7f2a...</div>
                    <div className="text-white/60 text-xs mt-2">
                      {Math.floor(Math.random() * 3000) + 1000} txns
                    </div>
                  </div>
                  {index < 4 && (
                    <div className="mx-2">
                      <Link2 className="w-4 h-4 text-watt-bitcoin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-center text-sm mt-4">
              Each block contains a cryptographic hash of the previous block, creating an unbreakable chain
            </p>
          </div>
        </ScrollReveal>

        {/* Key Concepts */}
        <ScrollReveal direction="up" delay={0.5}>
          <h3 className="text-2xl font-bold text-watt-navy mb-6 text-center">Key Concepts</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {concepts.map((concept, index) => (
              <div key={concept.title} className="bg-watt-light rounded-xl p-5 border border-watt-navy/10">
                <concept.icon className="w-8 h-8 text-watt-bitcoin mb-3" />
                <h4 className="font-bold text-watt-navy mb-2">{concept.title}</h4>
                <p className="text-sm text-watt-navy/70">{concept.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowBitcoinWorksSection;
