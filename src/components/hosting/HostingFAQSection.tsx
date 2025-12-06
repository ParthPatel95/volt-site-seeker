import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I ship my miners to your facility?',
    answer: 'We provide detailed shipping instructions and receiving coordination. Miners can be shipped directly to our Alberta facility. Our team will handle receiving, inspection, and setup. We recommend insured freight shipping for larger orders.'
  },
  {
    question: 'What is the typical setup time?',
    answer: 'Standard setup takes 24-48 hours from receipt of equipment. This includes physical installation, network configuration, pool setup, and initial optimization. Industrial clients may require additional time for custom deployments.'
  },
  {
    question: 'How is uptime guaranteed?',
    answer: 'We maintain 95%+ uptime through redundant power systems, backup generators, and N+1 cooling infrastructure. Our 24/7 monitoring team proactively addresses issues. Downtime credits are provided per our SLA agreements.'
  },
  {
    question: 'What monitoring tools do you provide?',
    answer: 'Clients receive access to our real-time dashboard showing hashrate, temperature, power consumption, and earnings. Email and SMS alerts notify you of any issues. API access is available for industrial clients.'
  },
  {
    question: 'How are mining rewards handled?',
    answer: 'You maintain full control of your mining pool and wallet settings. Rewards go directly to your configured wallet. We never have access to or control over your mining earnings.'
  },
  {
    question: 'What happens if my miner needs repair?',
    answer: 'Our on-site technicians handle basic troubleshooting and maintenance. For hardware failures, we can facilitate manufacturer warranty claims or connect you with repair services. Buy & Host clients have repairs included in their package.'
  },
  {
    question: 'Can I visit the facility?',
    answer: 'Yes, facility tours are available by appointment for current and prospective clients. Industrial clients typically conduct due diligence visits before signing agreements.'
  },
  {
    question: 'What are the payment terms?',
    answer: 'Hosting fees are billed monthly in advance based on actual power consumption. We accept bank transfers, cryptocurrency, and other methods for qualified clients. Industrial clients may negotiate custom billing arrangements.'
  }
];

export const HostingFAQSection = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-watt-navy/5 border border-watt-navy/10 rounded-full mb-4">
              <HelpCircle className="w-4 h-4 text-watt-navy" />
              <span className="text-sm font-medium text-watt-navy">Common Questions</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Everything you need to know about hosting with WattByte
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-watt-light border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow duration-300"
              >
                <AccordionTrigger className="text-left font-semibold text-watt-navy hover:text-watt-bitcoin transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-watt-navy/70 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
