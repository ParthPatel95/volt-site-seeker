import { motion } from 'framer-motion';
import { Mail, FileText, Search, PenTool, Rocket, CheckCircle } from 'lucide-react';
import { AnimatedTimeline } from '@/components/wattfund/AnimatedTimeline';

export const InvestmentProcessSection = () => {
  const steps = [
    {
      icon: Mail,
      title: "Initial Inquiry",
      description: "Contact our investor relations team to express interest and schedule an introductory call.",
      status: 'completed' as const,
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Receive comprehensive fund materials including PPM and portfolio overview.",
      status: 'completed' as const,
    },
    {
      icon: Search,
      title: "Due Diligence",
      description: "Deep-dive meetings with fund managers and site visits to portfolio assets.",
      status: 'active' as const,
    },
    {
      icon: PenTool,
      title: "Commitment",
      description: "Execute subscription documents and complete investor onboarding.",
      status: 'upcoming' as const,
    },
    {
      icon: Rocket,
      title: "Deployment",
      description: "Receive regular capital calls, quarterly reporting, and portfolio updates.",
      status: 'upcoming' as const,
    },
  ];

  const timelineEstimate = [
    { phase: "Initial Contact", duration: "Day 1", color: "watt-success" },
    { phase: "Materials Review", duration: "Week 1", color: "watt-trust" },
    { phase: "Due Diligence", duration: "Week 2-3", color: "watt-bitcoin" },
    { phase: "Commitment", duration: "Week 3-4", color: "watt-success" },
  ];

  return (
    <section id="process" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-watt-navy to-[#0a1628] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-watt-bitcoin/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-watt-trust/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Rocket className="w-4 h-4 text-watt-trust" />
            <span className="text-sm font-medium text-watt-trust">Investment Process</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            How To <span className="bg-gradient-to-r from-watt-trust to-watt-bitcoin bg-clip-text text-transparent">Invest</span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            A streamlined five-step process from initial inquiry to active investment
          </p>
        </motion.div>

        {/* Animated Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
            <AnimatedTimeline steps={steps} orientation="horizontal" />
          </div>
        </motion.div>

        {/* Timeline Estimate */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold text-white text-center mb-8">Expected Timeline</h3>
          
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-watt-success via-watt-trust to-watt-bitcoin"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>

            <div className="relative flex justify-between">
              {timelineEstimate.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.5 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full bg-${item.color} flex items-center justify-center shadow-lg mb-3`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-white font-semibold text-sm">{item.duration}</span>
                  <span className="text-white/50 text-xs text-center mt-1">{item.phase}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <p className="text-white/60 text-sm">
              Ready to start? Contact our investor relations team to begin your investment journey.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
