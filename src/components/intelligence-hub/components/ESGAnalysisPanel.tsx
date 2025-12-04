
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Shield, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ESGAnalysisPanelProps {
  analysisResult: any;
}

export function ESGAnalysisPanel({ analysisResult }: ESGAnalysisPanelProps) {
  const esg = analysisResult?.esg || analysisResult?.esgData || {};
  const hasData = Object.keys(esg).length > 0 || analysisResult?.esgRating;

  if (!hasData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Leaf className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No ESG Data Available</p>
        <p className="text-sm">Environmental, Social, and Governance metrics will appear here when available</p>
      </div>
    );
  }

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'bg-gray-500/10 text-gray-600';
    if (score >= 70) return 'bg-green-500/10 text-green-600';
    if (score >= 50) return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-red-500/10 text-red-600';
  };

  const overallScore = esg.overallScore || esg.total || analysisResult?.esgRating;
  const environmentalScore = esg.environmental?.score || esg.environmentalScore;
  const socialScore = esg.social?.score || esg.socialScore;
  const governanceScore = esg.governance?.score || esg.governanceScore;

  return (
    <div className="space-y-4">
      {/* Overall ESG Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Overall ESG Rating</p>
              <p className="text-xs text-muted-foreground">Composite sustainability score</p>
            </div>
            {overallScore && (
              <div className={`px-4 py-2 rounded-lg ${getScoreColor(typeof overallScore === 'number' ? overallScore : 50)}`}>
                <span className="text-2xl font-bold">{overallScore}</span>
                {typeof overallScore === 'number' && <span className="text-sm">/100</span>}
              </div>
            )}
          </div>

          {/* E, S, G Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg ${getScoreColor(environmentalScore)}`}>
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4" />
                <span className="text-xs font-medium">Environmental</span>
              </div>
              <p className="text-lg font-bold">{environmentalScore || 'N/A'}</p>
            </div>
            <div className={`p-3 rounded-lg ${getScoreColor(socialScore)}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Social</span>
              </div>
              <p className="text-lg font-bold">{socialScore || 'N/A'}</p>
            </div>
            <div className={`p-3 rounded-lg ${getScoreColor(governanceScore)}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Governance</span>
              </div>
              <p className="text-lg font-bold">{governanceScore || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Details */}
      {esg.environmental?.details && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Environmental Factors</span>
            </div>
            <div className="space-y-2">
              {esg.environmental.details.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.factor || item.name}</span>
                  <Badge variant="outline" className={`text-xs ${
                    (item.rating === 'Good' || item.score > 70) ? 'bg-green-500/10 text-green-600' :
                    (item.rating === 'Moderate' || item.score > 50) ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {item.rating || item.score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications & Awards */}
      {(esg.certifications || esg.awards) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Certifications & Recognition</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(esg.certifications || esg.awards || []).map((cert: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controversies */}
      {esg.controversies && esg.controversies.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Controversies</span>
            </div>
            <div className="space-y-2">
              {esg.controversies.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 bg-yellow-500/5 rounded">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span className="text-muted-foreground">{typeof item === 'string' ? item : item.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
