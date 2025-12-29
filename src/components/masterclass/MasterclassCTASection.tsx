import { motion } from "framer-motion";
import { GraduationCap, Award, Download, Share2, ArrowRight, CheckCircle2, Trophy, Star, Clock, Target, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Link } from "react-router-dom";

interface MasterclassCTASectionProps {
  totalTracks?: number;
  completedTracks?: number[];
}

const STORAGE_KEY = "masterclass-progress";

// Static color mappings for track badges
const trackBadgeColors = [
  { bg: "bg-purple-500", lightBg: "bg-purple-500/20", text: "text-purple-600" },
  { bg: "bg-orange-500", lightBg: "bg-orange-500/20", text: "text-orange-600" },
  { bg: "bg-blue-500", lightBg: "bg-blue-500/20", text: "text-blue-600" },
  { bg: "bg-green-500", lightBg: "bg-green-500/20", text: "text-green-600" },
  { bg: "bg-pink-500", lightBg: "bg-pink-500/20", text: "text-pink-600" }
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export const MasterclassCTASection = ({ totalTracks = 5, completedTracks: propCompletedTracks }: MasterclassCTASectionProps) => {
  const [completedTracks, setCompletedTracks] = useState<number[]>(propCompletedTracks || []);
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !propCompletedTracks) {
      try {
        const progress = JSON.parse(saved);
        const completed: number[] = [];
        if (progress.track1?.length >= 6) completed.push(1);
        if (progress.track2?.length >= 5) completed.push(2);
        if (progress.track3?.length >= 4) completed.push(3);
        if (progress.track4?.length >= 4) completed.push(4);
        if (progress.track5?.length >= 4) completed.push(5);
        setCompletedTracks(completed);
      } catch (e) {
        console.error("Failed to parse masterclass progress", e);
      }
    }
  }, [propCompletedTracks]);

  const progressPercentage = Math.round((completedTracks.length / totalTracks) * 100);
  const isComplete = completedTracks.length === totalTracks;
  
  // Get the next incomplete track
  const nextIncompleteTrack = [1, 2, 3, 4, 5].find(t => !completedTracks.includes(t)) || 1;

  const topicsLearned = [
    "Site evaluation using VoltScore™ methodology",
    "Multi-factor risk assessment frameworks",
    "Regulatory navigation across jurisdictions",
    "Capacity planning and portfolio management",
    "Capital raising strategies and deal structuring",
    "M&A valuation and due diligence processes"
  ];

  const nextSteps = [
    { icon: Target, title: "Apply VoltScore™", description: "Use the framework to evaluate your next site", href: "/voltscout" },
    { icon: Users, title: "Join Community", description: "Connect with other mining operators", href: "/wattfund" },
    { icon: Zap, title: "Book Consultation", description: "Get expert advice on your specific situation", href: "/contact" }
  ];

  return (
    <section id="masterclass-cta" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {isComplete ? (
          // Completion State
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              {/* Trophy Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 1 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/30">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-300 mb-4">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Masterclass Complete</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Congratulations! 🎉
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  You've completed the Strategic Operations Masterclass
                </p>

                {/* Certificate Card */}
                <div className="bg-card border-2 border-yellow-400 rounded-2xl p-8 mb-8 shadow-lg">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-yellow-500" />
                    <h3 className="text-2xl font-bold text-foreground">Certificate of Completion</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Strategic Operations Masterclass • 5 Tracks • ~2 Hours
                  </p>
                  
                  {/* Topics Grid */}
                  <div className="grid md:grid-cols-2 gap-3 text-left mb-6">
                    {topicsLearned.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{topic}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Achievement
                    </Button>
                  </div>
                </div>

                {/* Next Steps */}
                <h3 className="text-xl font-bold text-foreground mb-6">What's Next?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {nextSteps.map((step, index) => (
                    <Link to={step.href} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer shadow-sm h-full"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </ScrollReveal>
        ) : (
          // In-Progress State
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Keep Learning</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  You're Making Great Progress!
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  {completedTracks.length} of {totalTracks} tracks completed • {progressPercentage}% done
                </p>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-8">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 via-orange-500 to-green-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${progressPercentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Track 1</span>
                    <span>Track 5</span>
                  </div>
                </div>

                {/* Track Status */}
                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((track) => {
                    const isCompleted = completedTracks.includes(track);
                    const colors = trackBadgeColors[track - 1];
                    
                    return (
                      <div
                        key={track}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold",
                          isCompleted 
                            ? "bg-green-500 text-white" 
                            : `${colors.lightBg} ${colors.text}`
                        )}
                      >
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : track}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Learning Card */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center shrink-0">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Continue Your Journey
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Complete all 5 tracks to earn your certificate and master the full 
                      lifecycle of Bitcoin mining operations.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Button 
                        size="lg" 
                        className="gap-2"
                        onClick={() => scrollToSection(`track-${nextIncompleteTrack}`)}
                      >
                        Resume Track {nextIncompleteTrack}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => scrollToSection('intro')}
                      >
                        View All Tracks
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};
