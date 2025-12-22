import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, Lock, Users, Coins, ArrowRight, Building, Gem } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const WhatIsBitcoinSection: React.FC = () => {
  const pillars = [
    {
      icon: Lock,
      title: 'Decentralized',
      description: 'No central authority controls Bitcoin. It operates on a peer-to-peer network of thousands of computers worldwide.',
      color: 'bg-watt-bitcoin/10 text-watt-bitcoin'
    },
    {
      icon: Coins,
      title: 'Digital Scarcity',
      description: 'Only 21 million Bitcoin will ever exist. This fixed supply makes it resistant to inflation unlike traditional currencies.',
      color: 'bg-watt-trust/10 text-watt-trust'
    },
    {
      icon: Users,
      title: 'Peer-to-Peer',
      description: 'Send value directly to anyone, anywhere in the world, without intermediaries like banks or payment processors.',
      color: 'bg-watt-success/10 text-watt-success'
    }
  ];

  const comparisons = [
    {
      asset: 'Bitcoin',
      icon: Bitcoin,
      supply: 'Fixed (21M)',
      control: 'Decentralized',
      portability: 'Digital',
      divisibility: '100 Million Units',
      verification: 'Instant',
      highlight: true
    },
    {
      asset: 'US Dollar',
      icon: Building,
      supply: 'Unlimited',
      control: 'Central Bank',
      portability: 'Physical/Digital',
      divisibility: '100 Cents',
      verification: 'Bank Required',
      highlight: false
    },
    {
      asset: 'Gold',
      icon: Gem,
      supply: 'Limited',
      control: 'Miners/Markets',
      portability: 'Physical',
      divisibility: 'Difficult',
      verification: 'Expert Required',
      highlight: false
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <LearningObjectives
          objectives={[
            "Understand Bitcoin's core properties: decentralization, digital scarcity, and peer-to-peer transactions",
            "Compare Bitcoin's characteristics against traditional assets like USD and gold",
            "Grasp why Bitcoin's fixed supply of 21 million makes it unique"
          ]}
          estimatedTime="5 min"
        />
        
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/20 mb-4">
              <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">The Basics</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What is Bitcoin?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Bitcoin is the world's first decentralized digital currency, created in 2009 by an anonymous 
              person or group using the pseudonym Satoshi Nakamoto. It enables direct value transfer 
              without the need for banks or governments.
            </p>
          </div>
        </ScrollReveal>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} direction="up" delay={index * 0.1}>
              <div className="bg-card rounded-2xl p-6 border border-border shadow-institutional hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${pillar.color} flex items-center justify-center mb-4`}>
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground">{pillar.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison Table */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="bg-muted rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Bitcoin vs Traditional Assets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Asset</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Supply</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Control</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Portability</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Divisibility</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item) => (
                    <tr 
                      key={item.asset} 
                      className={`border-b border-border/50 ${item.highlight ? 'bg-watt-bitcoin/5' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-5 h-5 ${item.highlight ? 'text-watt-bitcoin' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${item.highlight ? 'text-watt-bitcoin' : 'text-foreground'}`}>
                            {item.asset}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{item.supply}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.control}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.portability}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.divisibility}</td>
                      <td className="py-4 px-4 text-muted-foreground">{item.verification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Insight */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mt-8 bg-gradient-to-r from-watt-bitcoin/10 to-watt-trust/10 rounded-2xl p-6 border border-watt-bitcoin/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-watt-bitcoin/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-watt-bitcoin" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground mb-1">Key Insight</h4>
                <p className="text-muted-foreground">
                  Bitcoin combines the scarcity of gold with the convenience of digital money, 
                  creating a new asset class that can be sent anywhere in the world in minutes 
                  for minimal fees.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Bitcoin is decentralized — no single entity controls the network",
            "Only 21 million Bitcoin will ever exist, creating digital scarcity",
            "Bitcoin combines gold's scarcity with digital money's convenience",
            "Verification is instant and doesn't require trusted third parties"
          ]}
          proTip="Bitcoin's fixed supply is enforced by code, not by policy. Unlike central banks that can print more currency, Bitcoin's 21 million cap is mathematically guaranteed."
          nextSteps={[
            { title: "Bitcoin History", href: "/bitcoin#history" },
            { title: "How Bitcoin Works", href: "/bitcoin#how-it-works" }
          ]}
        />
      </div>
    </section>
  );
};

export default WhatIsBitcoinSection;
