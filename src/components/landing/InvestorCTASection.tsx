import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrendingUp, Mail, FileText, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { InvestmentInquiryForm } from './InvestmentInquiryForm';

export const InvestorCTASection = () => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  
  const handleFormSuccess = () => {
    setShowInquiryForm(false);
  };

  return (
    <>
      <Dialog open={showInquiryForm} onOpenChange={setShowInquiryForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-watt-navy">
              Start Your Investment Journey
            </DialogTitle>
            <DialogDescription className="text-watt-navy/70">
              Fill out the form below and our investment team will contact you to discuss opportunities in WattFund.
            </DialogDescription>
          </DialogHeader>
          <InvestmentInquiryForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <section id="cta" className="relative z-10 py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-watt-navy via-[#0a1628] to-watt-navy">
          {/* Aurora effect */}
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 194, 203, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(247, 147, 26, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/15 border border-watt-bitcoin/30 mb-8"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(247, 147, 26, 0.1)',
                  '0 0 40px rgba(247, 147, 26, 0.2)',
                  '0 0 20px rgba(247, 147, 26, 0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Limited Fund I Allocation</span>
            </motion.div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Ready to Invest in{' '}
              <span className="bg-gradient-to-r from-watt-bitcoin via-watt-trust to-watt-success bg-clip-text text-transparent">
                Digital Infrastructure
              </span>
              ?
            </h2>

            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              Join institutional investors capitalizing on the power-to-data arbitrage opportunity. 
              Access exclusive investment materials and speak with our fund managers.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                { value: "60%", label: "Fund I Committed" },
                { value: "$25M", label: "Target Size" },
                { value: "Q1 2025", label: "First Close" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-watt-bitcoin mb-1">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg"
                  onClick={() => setShowInquiryForm(true)}
                  className="relative overflow-hidden bg-gradient-to-r from-watt-bitcoin to-orange-600 hover:from-watt-bitcoin/90 hover:to-orange-600/90 text-white px-10 py-7 text-xl font-bold rounded-xl shadow-lg shadow-watt-bitcoin/30 transition-all"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <TrendingUp className="w-6 h-6 mr-3 relative z-10" />
                  <span className="relative z-10">Start Investing</span>
                  <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg"
                  variant="ghost-dark"
                  onClick={() => setShowInquiryForm(true)}
                  className="px-8 py-7 text-lg font-semibold rounded-xl border border-white/20 hover:bg-white/10"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Request Materials
                </Button>
              </motion.div>
            </div>

            {/* Contact Options */}
            <div className="flex flex-wrap justify-center gap-6 text-white/50 text-sm">
              <motion.a
                href="mailto:invest@wattbyte.com"
                className="flex items-center gap-2 hover:text-watt-trust transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Mail className="w-4 h-4" />
                invest@wattbyte.com
              </motion.a>
              <motion.a
                href="tel:+1-555-WATTFUND"
                className="flex items-center gap-2 hover:text-watt-bitcoin transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Phone className="w-4 h-4" />
                +1 (555) WATT-FUND
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
