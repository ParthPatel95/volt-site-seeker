import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, DollarSign, Shield, Zap, Building, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TISectionWrapper, TISectionHeader, TIKeyInsight, TIContentCard } from './shared';

const AlbertaCaseStudySection = () => {
  return (
    <TISectionWrapper id="case-study" theme="gradient">
      <ScrollReveal>
        <TISectionHeader badge="Lesson 10" badgeIcon={MapPin} title="Alberta 45MW Case Study" description="Complete tax and insurance analysis for our Heartland hydro-cooled Bitcoin mining facility." accentColor="purple" />
      </ScrollReveal>
      
      <ScrollReveal delay={50}>
        <div className="bg-[hsl(var(--watt-purple)/0.05)] border border-[hsl(var(--watt-purple)/0.2)] rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Facility Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center"><Zap className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }} /><div className="text-2xl font-bold text-foreground">45 MW</div><div className="text-sm text-muted-foreground">Power Capacity</div></div>
            <div className="text-center"><Building className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-purple))' }} /><div className="text-2xl font-bold text-foreground">30</div><div className="text-sm text-muted-foreground">Hydro Containers</div></div>
            <div className="text-center"><DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-success))' }} /><div className="text-2xl font-bold text-foreground">$75M</div><div className="text-sm text-muted-foreground">Total CapEx</div></div>
            <div className="text-center"><TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }} /><div className="text-2xl font-bold text-foreground">~30 BTC</div><div className="text-sm text-muted-foreground">Monthly Production</div></div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <TIContentCard borderColor="hsl(var(--watt-purple))">
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />Year 1 Tax Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Mining Revenue (360 BTC @ $60K)</span><span className="font-medium text-foreground">$21.6M</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Less: Operating Expenses</span><span className="font-medium text-red-500">($20.0M)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Less: CCA Deduction (AIIP)</span><span className="font-medium text-red-500">($45.6M)</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="font-medium text-foreground">Taxable Income (Loss)</span><span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>($44.0M)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax Rate</span><span className="text-foreground">23%</span></div>
              <div className="flex justify-between bg-muted p-2 rounded"><span className="font-medium text-foreground">Tax Payable</span><span className="font-bold" style={{ color: 'hsl(var(--watt-success))' }}>$0 (Loss carry-forward)</span></div>
            </div>
          </TIContentCard>
          <TIContentCard borderColor="hsl(var(--watt-bitcoin))">
            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2"><Shield className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />Annual Insurance Portfolio</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Property ($80M coverage)</span><span className="font-medium text-foreground">$240,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Business Interruption (6 mo)</span><span className="font-medium text-foreground">$120,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Equipment Breakdown</span><span className="font-medium text-foreground">$60,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">General Liability ($5M)</span><span className="font-medium text-foreground">$35,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cyber Insurance ($5M)</span><span className="font-medium text-foreground">$75,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">D&O Coverage ($2M)</span><span className="font-medium text-foreground">$45,000</span></div>
              <div className="border-t pt-2 flex justify-between bg-muted p-2 rounded"><span className="font-bold text-foreground">Total Annual Premium</span><span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>$575,000</span></div>
            </div>
          </TIContentCard>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <TIKeyInsight title="Key Takeaways from 45MW Analysis" type="success">
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />$44M loss carry-forward shields future profits</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />AIIP provides massive Year 1 deductions</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />Alberta's 0% PST saved ~$5M on equipment</li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />~$575K insurance = 2.6% of annual revenue</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />Heat recovery qualifies for 30% Clean Tech ITC</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />SR&ED potential for cooling R&D activities</li>
            </ul>
          </div>
        </TIKeyInsight>
      </ScrollReveal>
    </TISectionWrapper>
  );
};

export default AlbertaCaseStudySection;
