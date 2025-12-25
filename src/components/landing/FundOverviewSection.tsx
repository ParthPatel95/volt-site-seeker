import { motion } from 'framer-motion';
import { Target, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { RadialProgress } from '@/components/wattfund/RadialProgress';

export const FundOverviewSection = () => {
  const stats = [
    { icon: Zap, label: "Power Capacity", value: "700+ MW", color: "text-watt-bitcoin" },
    { icon: Target, label: "Land Assets", value: "150+ Acres", color: "text-watt-trust" },
    { icon: TrendingUp, label: "Exit Value", value: "$10-15M/MW", color: "text-watt-success" },
  ];

  return (
    <section id="fund-overview" className="relative z-10 py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-watt-navy to-[#0a1628] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-watt-trust/5 rounded-full blur-[150px]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <DollarSign className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Fund I Details</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Fund <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">Overview</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Strategic infrastructure investments with institutional-grade returns
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left - Radial Progress Indicators */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-watt-trust/20 to-watt-bitcoin/20 blur-xl" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-8 text-center">Target Returns</h3>
              
              <div className="flex flex-wrap justify-center gap-8">
                <RadialProgress
                  value={2.25}
                  max={3}
                  size={140}
                  label="MOIC Target"
                  sublabel="2.0-2.5x Multiple"
                  color="trust"
                  suffix="x"
                  prefix=""
                />
                
                <RadialProgress
                  value={35}
                  max={50}
                  size={140}
                  label="Net IRR"
                  sublabel="30-40% Range"
                  color="success"
                  suffix="%"
                />
              </div>

              {/* Timeline */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-watt-bitcoin mb-1">
                      <AnimatedCounter end={2} suffix=" Years" />
                    </div>
                    <p className="text-white/50 text-sm">Hold Period</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-watt-trust mb-1">$25M</div>
                    <p className="text-white/50 text-sm">Fund Size</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-watt-success mb-1">12-15</div>
                    <p className="text-white/50 text-sm">Investments</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Pipeline Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-watt-bitcoin/20 to-watt-success/20 blur-xl" />
            
            <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 h-full">
              <h3 className="text-xl font-bold text-white mb-8 text-center">Current Pipeline</h3>
              
              <div className="space-y-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <motion.div 
                      className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white/50 text-sm">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Exit Strategy */}
              <div className="mt-6 p-4 bg-gradient-to-r from-watt-success/10 to-transparent rounded-xl border border-watt-success/20">
                <h4 className="text-sm font-semibold text-watt-success mb-2">Exit Strategy</h4>
                <p className="text-white/60 text-sm">
                  Structured exits to hyperscalers, data center operators, and strategic infrastructure buyers
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Deployment Cost", value: "$250k/MW", color: "text-watt-bitcoin" },
            { label: "Operating Margin", value: "60%+", color: "text-watt-success" },
            { label: "Revenue Multiple", value: "3-5x", color: "text-watt-trust" },
            { label: "Cash-on-Cash", value: "25%+", color: "text-white" },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
            >
              <p className={`text-2xl font-bold ${item.color} mb-1`}>{item.value}</p>
              <p className="text-white/50 text-xs">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
