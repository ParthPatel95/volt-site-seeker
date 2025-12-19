import { ArrowRight, Bitcoin, Zap, HelpCircle, BookOpen, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Path recommendation quiz
const quizQuestions = [
  {
    question: "What's your experience with Bitcoin?",
    options: [
      { label: "Complete beginner", path: "bitcoin" },
      { label: "Know the basics", path: "operations" },
      { label: "Already mining or investing", path: "energy" },
    ],
  },
];

export const AcademyCTASection = () => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleQuizAnswer = (path: string) => {
    setSelectedAnswer(path);
    setTimeout(() => setShowRecommendation(true), 300);
  };

  const getRecommendation = () => {
    switch (selectedAnswer) {
      case "bitcoin":
        return { title: "Bitcoin 101", route: "/bitcoin", description: "Start with the fundamentals of Bitcoin and blockchain technology." };
      case "operations":
        return { title: "Mining Operations", route: "/datacenters", description: "Dive into datacenter design and infrastructure." };
      case "energy":
        return { title: "Energy Markets", route: "/aeso-101", description: "Master Alberta's energy market for optimal mining economics." };
      default:
        return null;
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy/90 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-watt-bitcoin rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-watt-blue rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-watt-success/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-watt-bitcoin" />
                <span className="text-sm font-medium text-watt-bitcoin">Start Your Journey Today</span>
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to Master Bitcoin Mining?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Whether you're an investor looking to understand the fundamentals or an operator 
                seeking technical knowledge, WattByte Academy has you covered.
              </p>
            </div>
          </ScrollReveal>

          {/* Path Finder Quiz */}
          <ScrollReveal delay={200}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-12"
            >
              {!showRecommendation ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-watt-bitcoin/20 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-watt-bitcoin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Not sure where to start?</h3>
                      <p className="text-sm text-white/60">Answer one quick question</p>
                    </div>
                  </div>

                  <p className="text-white/90 mb-4">{quizQuestions[0].question}</p>

                  <div className="grid gap-3">
                    {quizQuestions[0].options.map((option, index) => (
                      <motion.button
                        key={option.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuizAnswer(option.path)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          selectedAnswer === option.path
                            ? "bg-watt-bitcoin/20 border-watt-bitcoin text-white"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <span className="font-medium">{option.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    We recommend: {getRecommendation()?.title}
                  </h3>
                  <p className="text-white/70 mb-6">{getRecommendation()?.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white"
                      onClick={() => navigate(getRecommendation()?.route || '/bitcoin')}
                    >
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => {
                        setSelectedAnswer(null);
                        setShowRecommendation(false);
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </ScrollReveal>

          {/* Direct CTAs */}
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white shadow-lg shadow-watt-bitcoin/20"
                onClick={() => navigate('/bitcoin')}
              >
                <Bitcoin className="w-5 h-5 mr-2" />
                Start with Bitcoin 101
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => navigate('/aeso-101')}
              >
                <Zap className="w-5 h-5 mr-2" />
                Jump to Energy Markets
              </Button>
            </div>
          </ScrollReveal>

          {/* Facts Section - Only verifiable information */}
          <ScrollReveal delay={400}>
            <div className="border-t border-white/10 pt-8">
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-6 h-6 text-watt-bitcoin" />
                  </div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-sm text-white/50">Modules</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-watt-bitcoin" />
                  </div>
                  <p className="text-2xl font-bold text-white">107</p>
                  <p className="text-sm text-white/50">Total Lessons</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/50 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400/70" />
                  No signup required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400/70" />
                  Always free
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400/70" />
                  Industry-verified
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
