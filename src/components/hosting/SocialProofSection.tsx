import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Star, Users, Server, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Michael R.',
    role: 'Mining Fund Manager',
    company: 'Digital Asset Investments',
    content: 'WattByte\'s hosting has been rock solid. The competitive rates and professional support have significantly improved our mining ROI.',
    rating: 5
  },
  {
    name: 'Sarah K.',
    role: 'Operations Director',
    company: 'BlockScale Mining',
    content: 'Moving our fleet to WattByte was the best decision we made. The cold climate advantage and direct grid access are unmatched.',
    rating: 5
  },
  {
    name: 'James L.',
    role: 'Individual Miner',
    company: '',
    content: 'Professional setup, great monitoring tools, and responsive support. Everything I need to run my mining operation stress-free.',
    rating: 5
  }
];

const stats = [
  { icon: Server, value: 500, suffix: '+', label: 'Miners Hosted' },
  { icon: Users, value: 50, suffix: '+', label: 'Active Clients' },
  { icon: Award, value: 99.9, suffix: '%', label: 'Client Satisfaction' },
];

export const SocialProofSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-watt-light">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
              Trusted by Miners Worldwide
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who trust WattByte for their hosting needs
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Bar */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-watt-bitcoin/10 mb-3">
                    <Icon className="w-6 h-6 text-watt-bitcoin" />
                  </div>
                  <div className="text-2xl md:text-4xl font-bold text-watt-navy">
                    <AnimatedCounter 
                      end={stat.value} 
                      suffix={stat.suffix} 
                    />
                  </div>
                  <div className="text-sm text-watt-navy/60">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Testimonials Carousel */}
        <ScrollReveal delay={0.2}>
          <div className="relative bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
            {/* Quote Mark */}
            <div className="absolute -top-4 left-8 text-6xl text-watt-bitcoin/20 font-serif">"</div>
            
            <div className="relative min-h-[200px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === activeTestimonial 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 absolute inset-0 translate-x-4 pointer-events-none'
                  }`}
                >
                  {/* Stars */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-watt-bitcoin fill-watt-bitcoin" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg text-watt-navy mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-watt-navy/10 flex items-center justify-center mr-4">
                      <span className="text-lg font-bold text-watt-navy">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-watt-navy">{testimonial.name}</div>
                      <div className="text-sm text-watt-navy/60">
                        {testimonial.role}
                        {testimonial.company && ` · ${testimonial.company}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'w-6 bg-watt-bitcoin' 
                      : 'w-2 bg-watt-navy/20 hover:bg-watt-navy/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
