import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Clock, FileText, Cpu, Pizza, DollarSign, TrendingUp, Building2, Landmark, Sparkles } from 'lucide-react';

const BitcoinHistorySection: React.FC = () => {
  const timeline = [
    {
      year: '2008',
      title: 'The Whitepaper',
      description: 'Satoshi Nakamoto publishes "Bitcoin: A Peer-to-Peer Electronic Cash System"',
      icon: FileText,
      color: 'bg-watt-bitcoin'
    },
    {
      year: '2009',
      title: 'Genesis Block',
      description: 'The first Bitcoin block is mined, embedding a headline about bank bailouts',
      icon: Cpu,
      color: 'bg-watt-trust'
    },
    {
      year: '2010',
      title: 'First Purchase',
      description: 'Laszlo Hanyecz buys two pizzas for 10,000 BTC (~$41 at the time)',
      icon: Pizza,
      color: 'bg-watt-success'
    },
    {
      year: '2011',
      title: 'Parity with USD',
      description: 'Bitcoin reaches $1 for the first time, proving real-world value',
      icon: DollarSign,
      color: 'bg-watt-bitcoin'
    },
    {
      year: '2013',
      title: '$1,000 Milestone',
      description: 'Bitcoin crosses $1,000 amid growing mainstream attention',
      icon: TrendingUp,
      color: 'bg-watt-trust'
    },
    {
      year: '2017',
      title: 'Bull Run',
      description: 'Bitcoin reaches nearly $20,000, ICO boom, widespread media coverage',
      icon: TrendingUp,
      color: 'bg-watt-success'
    },
    {
      year: '2020',
      title: 'Institutional Adoption',
      description: 'MicroStrategy, Tesla, and other corporations add Bitcoin to balance sheets',
      icon: Building2,
      color: 'bg-watt-bitcoin'
    },
    {
      year: '2021',
      title: 'Legal Tender',
      description: 'El Salvador becomes the first country to adopt Bitcoin as legal tender',
      icon: Landmark,
      color: 'bg-watt-trust'
    },
    {
      year: '2024',
      title: 'Spot ETF Approval',
      description: 'SEC approves Bitcoin spot ETFs, opening doors for mainstream investment',
      icon: Sparkles,
      color: 'bg-watt-success'
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-navy/10 border border-watt-navy/20 mb-4">
              <Clock className="w-4 h-4 text-watt-navy" />
              <span className="text-sm font-medium text-watt-navy">Timeline</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-4">
              The History of Bitcoin
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              From a cryptography mailing list to a trillion-dollar asset class, 
              Bitcoin's journey has been nothing short of revolutionary.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-watt-navy/10 transform md:-translate-x-1/2" />

          <div className="space-y-8">
            {timeline.map((event, index) => (
              <ScrollReveal key={event.year} direction={index % 2 === 0 ? 'left' : 'right'} delay={index * 0.05}>
                <div className={`relative flex items-center gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <div className={`inline-block bg-white rounded-xl p-5 shadow-institutional border border-watt-navy/10 ${index % 2 === 0 ? 'md:ml-auto' : ''}`}>
                      <div className="text-sm font-bold text-watt-bitcoin mb-1">{event.year}</div>
                      <h3 className="text-lg font-bold text-watt-navy mb-2">{event.title}</h3>
                      <p className="text-watt-navy/70 text-sm">{event.description}</p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10">
                    <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center shadow-lg`}>
                      <event.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Fun Fact */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mt-12 bg-white rounded-2xl p-6 border border-watt-navy/10 shadow-institutional">
            <div className="flex items-center gap-3 mb-3">
              <Pizza className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-watt-navy">Bitcoin Pizza Day</h3>
            </div>
            <p className="text-watt-navy/70">
              May 22nd is celebrated as "Bitcoin Pizza Day" in honor of the first real-world Bitcoin transaction. 
              Those 10,000 BTC would be worth over <span className="font-bold text-watt-bitcoin">$1 billion</span> today, 
              making it the most expensive pizza in history!
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinHistorySection;
