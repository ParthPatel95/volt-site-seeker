import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Calculator, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  BookOpen,
  MapPin,
  Droplets,
  Cable,
  GraduationCap,
  Award
} from 'lucide-react';
import { MECSectionWrapper } from './shared';

const MiningEconomicsCTASection = () => {
  const keyLearnings = [
    {
      icon: Calculator,
      title: "Profitability Modeling",
      description: "Calculate break-even, ROI, and scenario analysis",
      color: 'hsl(var(--watt-success))'
    },
    {
      icon: Zap,
      title: "Cost Structure Mastery",
      description: "Energy at 60-80%, hardware depreciation, operations",
      color: 'hsl(var(--watt-bitcoin))'
    },
    {
      icon: TrendingUp,
      title: "Strategic Frameworks",
      description: "Market cycles, timing, risk management",
      color: 'hsl(var(--watt-purple))'
    }
  ];

  const completedTopics = [
    "Revenue drivers & hash price calculation",
    "Full cost structure breakdown",
    "Break-even analysis methodology",
    "Hardware ROI evaluation",
    "Difficulty adjustment mechanics",
    "Strategic decision frameworks",
    "Market cycle strategies"
  ];

  const nextModules = [
    {
      to: "/site-selection",
      icon: MapPin,
      title: "Site Selection",
      description: "Evaluate and choose optimal mining locations based on energy, climate, and infrastructure.",
      color: 'hsl(var(--watt-success))'
    },
    {
      to: "/immersion-cooling",
      icon: Droplets,
      title: "Immersion Cooling",
      description: "Maximize hardware efficiency and lifespan with advanced liquid cooling systems.",
      color: 'hsl(var(--watt-bitcoin))'
    },
    {
      to: "/electrical-infrastructure",
      icon: Cable,
      title: "Electrical Infrastructure",
      description: "Design and build power systems that reliably support mining operations at scale.",
      color: 'hsl(var(--watt-purple))'
    }
  ];

  return (
    <MECSectionWrapper id="conclusion" theme="dark">
      <div className="max-w-5xl mx-auto">
        {/* Completion Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-16"
          style={{ backgroundColor: 'hsl(var(--watt-navy))' }}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: 'hsl(var(--watt-success))' }}
            />
            <div 
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: 'hsl(var(--watt-bitcoin))' }}
            />
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--watt-success)) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }} />
            </div>
          </div>
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8"
            >
              <div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border"
                style={{
                  backgroundColor: 'hsl(var(--watt-success) / 0.15)',
                  borderColor: 'hsl(var(--watt-success) / 0.3)'
                }}
              >
                <Award className="w-5 h-5" style={{ color: 'hsl(var(--watt-success))' }} />
                <span 
                  className="font-semibold"
                  style={{ color: 'hsl(var(--watt-success))' }}
                >
                  Module Complete
                </span>
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Mining Economics Mastered
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                You've completed a comprehensive deep dive into the financial fundamentals 
                of Bitcoin mining — from revenue mechanics to strategic decision-making.
              </p>
            </motion.div>

            {/* Key Learnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-4 mb-10"
            >
              {keyLearnings.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="font-semibold text-white mb-1">{item.title}</div>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Topics Covered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-xl p-6 border border-white/10 mb-10"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" style={{ color: 'hsl(var(--watt-success))' }} />
                Topics Covered in This Module
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {completedTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: 'hsl(var(--watt-success))' }}
                    />
                    {topic}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/academy" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'hsl(var(--watt-success))',
                  color: 'white'
                }}
              >
                <BookOpen className="w-5 h-5" />
                Back to Academy
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/app/profitability" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <Calculator className="w-5 h-5" />
                Try Profitability Calculator
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Continue Learning Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Continue Your Learning</h3>
            <p className="text-white/60">
              Explore related modules to deepen your mining expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {nextModules.map((module, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link 
                  to={module.to} 
                  className="block bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group h-full"
                >
                  <div 
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <module.icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                  <h4 className="font-bold text-white mb-2 group-hover:text-[hsl(var(--watt-success))] transition-colors flex items-center gap-2">
                    {module.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">{module.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MECSectionWrapper>
  );
};

export default MiningEconomicsCTASection;
