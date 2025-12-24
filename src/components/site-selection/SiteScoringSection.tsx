import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calculator, Star, TrendingUp, AlertCircle } from 'lucide-react';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';

const SiteScoringSection = () => {
  const [scores, setScores] = useState({
    energyCost: 8,
    powerCapacity: 7,
    interconnectionTimeline: 6,
    regulatory: 8,
    climate: 9,
    landCost: 7,
    infrastructure: 6,
    expansion: 8
  });

  const criteria = [
    { key: 'energyCost', label: 'Energy Cost', weight: 25, description: 'All-in $/kWh competitiveness' },
    { key: 'powerCapacity', label: 'Power Capacity', weight: 20, description: 'Available MW for current and future needs' },
    { key: 'interconnectionTimeline', label: 'Interconnection Timeline', weight: 15, description: 'Speed to energization' },
    { key: 'regulatory', label: 'Regulatory Environment', weight: 12, description: 'Permitting ease and crypto stance' },
    { key: 'climate', label: 'Climate Advantage', weight: 10, description: 'Cooling efficiency and PUE impact' },
    { key: 'landCost', label: 'Land Cost', weight: 8, description: 'Purchase or lease economics' },
    { key: 'infrastructure', label: 'Infrastructure', weight: 5, description: 'Roads, fiber, water, workforce' },
    { key: 'expansion', label: 'Expansion Potential', weight: 5, description: 'Room to grow beyond initial build' }
  ];

  const calculateWeightedScore = () => {
    let totalScore = 0;
    criteria.forEach(c => {
      totalScore += (scores[c.key as keyof typeof scores] * c.weight) / 100;
    });
    return totalScore.toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-watt-success';
    if (score >= 6) return 'text-watt-bitcoin';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGrade = (score: number) => {
    if (score >= 8.5) return { grade: 'A', label: 'Excellent', color: 'bg-watt-success' };
    if (score >= 7.5) return { grade: 'B', label: 'Good', color: 'bg-blue-500' };
    if (score >= 6.5) return { grade: 'C', label: 'Average', color: 'bg-watt-bitcoin' };
    if (score >= 5) return { grade: 'D', label: 'Below Average', color: 'bg-yellow-500' };
    return { grade: 'F', label: 'Poor', color: 'bg-red-500' };
  };

  const weightedScore = parseFloat(calculateWeightedScore());
  const gradeInfo = getGrade(weightedScore);

  const exampleSites = [
    {
      name: "Alberta Heartland",
      location: "Alberta, Canada",
      scores: { energyCost: 9, powerCapacity: 10, interconnectionTimeline: 8, regulatory: 9, climate: 10, landCost: 8, infrastructure: 7, expansion: 9 },
      total: 9.1,
      grade: 'A'
    },
    {
      name: "West Texas Site",
      location: "ERCOT, Texas",
      scores: { energyCost: 8, powerCapacity: 9, interconnectionTimeline: 5, regulatory: 8, climate: 4, landCost: 9, infrastructure: 6, expansion: 8 },
      total: 7.4,
      grade: 'B'
    },
    {
      name: "Paraguay Hydro",
      location: "Hernandarias",
      scores: { energyCost: 10, powerCapacity: 7, interconnectionTimeline: 6, regulatory: 5, climate: 3, landCost: 9, infrastructure: 4, expansion: 6 },
      total: 7.0,
      grade: 'C'
    }
  ];

  return (
    <section id="site-scoring" className="py-20 bg-watt-light">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Site Scoring
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              VoltScore™ Site Evaluation
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Use our weighted scoring methodology to objectively compare sites 
              and make data-driven acquisition decisions.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            variant="light"
            objectives={[
              "Apply weighted scoring methodology across 8 evaluation criteria",
              "Interpret VoltScore™ grades (A-F) and corresponding recommended actions",
              "Compare sites objectively using quantitative and qualitative factors",
              "Understand why energy cost (25%) and power capacity (20%) receive highest weights"
            ]}
            estimatedTime="8 min"
            prerequisites={[
              { title: "Due Diligence", href: "#due-diligence" }
            ]}
          />
        </ScrollReveal>

        {/* Interactive Scorer */}
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-watt-purple" />
              Interactive Site Scorer
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {criteria.map((c) => (
                  <div key={c.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-watt-navy">
                        {c.label}
                        <span className="text-watt-purple ml-1">({c.weight}%)</span>
                      </label>
                      <span className={`font-bold ${getScoreColor(scores[c.key as keyof typeof scores])}`}>
                        {scores[c.key as keyof typeof scores]}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores[c.key as keyof typeof scores]}
                      onChange={(e) => setScores(prev => ({ ...prev, [c.key]: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-watt-navy/50">{c.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className={`absolute inset-0 rounded-full ${gradeInfo.color} opacity-20`} />
                  <div className="absolute inset-4 bg-white rounded-full shadow-lg flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-watt-navy">{gradeInfo.grade}</div>
                    <div className="text-lg text-watt-navy/70">{weightedScore}/10</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className={`text-xl font-bold ${gradeInfo.color === 'bg-watt-success' ? 'text-watt-success' : gradeInfo.color === 'bg-blue-500' ? 'text-blue-500' : gradeInfo.color === 'bg-watt-bitcoin' ? 'text-watt-bitcoin' : gradeInfo.color === 'bg-yellow-500' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {gradeInfo.label} Site
                  </div>
                  <p className="text-sm text-watt-navy/60 mt-1">
                    {weightedScore >= 8 ? 'Proceed with full due diligence' :
                     weightedScore >= 6 ? 'Further investigation recommended' :
                     'Consider alternative sites'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Scoring Criteria Explanation */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {criteria.slice(0, 4).map((c, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-watt-navy">{c.label}</span>
                  <span className="text-sm text-watt-purple font-bold">{c.weight}%</span>
                </div>
                <div className="space-y-1 text-xs text-watt-navy/60">
                  <div className="flex justify-between"><span>10:</span><span>Best in class</span></div>
                  <div className="flex justify-between"><span>7-9:</span><span>Above average</span></div>
                  <div className="flex justify-between"><span>4-6:</span><span>Average</span></div>
                  <div className="flex justify-between"><span>1-3:</span><span>Below average</span></div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Example Sites Comparison */}
        <ScrollReveal delay={300}>
          <div className="bg-watt-navy rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-watt-bitcoin" />
              Example Site Comparisons
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {exampleSites.map((site, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white">{site.name}</h4>
                      <p className="text-sm text-white/60">{site.location}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      site.grade === 'A' ? 'bg-watt-success text-white' :
                      site.grade === 'B' ? 'bg-blue-500 text-white' :
                      'bg-watt-bitcoin text-white'
                    }`}>
                      {site.grade}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(site.scores).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-white/70 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${value >= 8 ? 'bg-watt-success' : value >= 6 ? 'bg-watt-bitcoin' : 'bg-red-400'}`}
                              style={{ width: `${value * 10}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/90 w-4">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <div className="text-2xl font-bold text-watt-bitcoin">{site.total}</div>
                    <div className="text-xs text-white/60">Overall Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Decision Matrix */}
        <ScrollReveal delay={400}>
          <div className="mt-8 bg-gradient-to-r from-watt-success/10 to-watt-bitcoin/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-watt-navy mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-watt-purple" />
              Decision Matrix
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-watt-success/20 rounded-xl p-4 text-center">
                <Star className="w-6 h-6 text-watt-success mx-auto mb-2" />
                <div className="font-bold text-watt-success">8.0+</div>
                <div className="text-sm text-watt-navy">Proceed</div>
                <div className="text-xs text-watt-navy/60">Full due diligence</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center">
                <div className="font-bold text-blue-600">6.5-7.9</div>
                <div className="text-sm text-watt-navy">Investigate</div>
                <div className="text-xs text-watt-navy/60">Identify improvements</div>
              </div>
              <div className="bg-watt-bitcoin/20 rounded-xl p-4 text-center">
                <div className="font-bold text-watt-bitcoin">5.0-6.4</div>
                <div className="text-sm text-watt-navy">Negotiate</div>
                <div className="text-xs text-watt-navy/60">Requires favorable terms</div>
              </div>
              <div className="bg-red-100 rounded-xl p-4 text-center">
                <div className="font-bold text-red-500">&lt;5.0</div>
                <div className="text-sm text-watt-navy">Pass</div>
                <div className="text-xs text-watt-navy/60">Seek alternatives</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={450}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "Energy cost (25%) and power capacity (20%) are the most heavily weighted criteria — prioritize these",
              "A VoltScore of 8.0+ indicates a site worth pursuing with full due diligence",
              "Scores of 6.5-7.9 warrant investigation to identify improvement opportunities",
              "Sites scoring below 5.0 should generally be passed on in favor of alternatives"
            ]}
            proTip="Don't let one exceptional criterion (like ultra-low energy cost) blind you to weaknesses elsewhere. A balanced scorecard across all 8 criteria produces better long-term outcomes."
            nextSection={{
              title: "Development Timeline",
              href: "#timeline"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SiteScoringSection;
