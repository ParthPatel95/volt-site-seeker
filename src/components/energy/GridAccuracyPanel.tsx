
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Database, CheckCircle, Eye, Activity } from 'lucide-react';
import { AccuracyMetrics } from '@/hooks/useEnhancedGridLineTracer';

interface GridAccuracyPanelProps {
  accuracyMetrics: AccuracyMetrics;
}

export function GridAccuracyPanel({ accuracyMetrics }: GridAccuracyPanelProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800 border-green-200';
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B+': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return { level: 'Excellent', color: 'text-green-600' };
    if (score >= 0.8) return { level: 'Very Good', color: 'text-blue-600' };
    if (score >= 0.7) return { level: 'Good', color: 'text-yellow-600' };
    if (score >= 0.6) return { level: 'Fair', color: 'text-orange-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Shield className="h-5 w-5" />
          Multi-AI Accuracy & Validation Metrics
          <Badge variant="secondary" className="ml-2">
            <Database className="h-3 w-3 mr-1" />
            Grade {accuracyMetrics.qualityGrade}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive accuracy assessment using multiple AI models and validation sources
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Quality Grade */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-medium text-gray-700">Overall Quality Grade</span>
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {accuracyMetrics.qualityGrade}
            </div>
            <Badge className={getGradeColor(accuracyMetrics.qualityGrade)}>
              {getConfidenceLevel(accuracyMetrics.ensembleConfidence).level} Accuracy
            </Badge>
          </div>

          {/* Accuracy Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Ensemble Confidence</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(accuracyMetrics.ensembleConfidence * 100).toFixed(0)}%
              </div>
              <Progress value={accuracyMetrics.ensembleConfidence * 100} className="h-2" />
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Model Agreement</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {(accuracyMetrics.modelAgreement * 100).toFixed(0)}%
              </div>
              <Progress value={accuracyMetrics.modelAgreement * 100} className="h-2" />
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Database Matches</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {accuracyMetrics.utilityDatabaseMatches}
              </div>
              <div className="text-xs text-gray-500">Infrastructure verified</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Historical Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {(accuracyMetrics.historicalAccuracy * 100).toFixed(0)}%
              </div>
              <Progress value={accuracyMetrics.historicalAccuracy * 100} className="h-2" />
            </div>
          </div>

          {/* Validation Sources */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Validation Sources
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accuracyMetrics.validationSources.map((source, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy Insights */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h5 className="font-medium text-indigo-800 mb-2">Accuracy Assessment</h5>
            <div className="text-sm text-indigo-700 space-y-1">
              <div>• Multi-AI ensemble confidence: {(accuracyMetrics.ensembleConfidence * 100).toFixed(1)}% - {getConfidenceLevel(accuracyMetrics.ensembleConfidence).level.toLowerCase()} reliability</div>
              <div>• Model agreement rate: {(accuracyMetrics.modelAgreement * 100).toFixed(1)}% - {accuracyMetrics.modelAgreement > 0.85 ? 'strong consensus across AI models' : 'moderate consensus, review recommended'}</div>
              <div>• Cross-validated against {accuracyMetrics.utilityDatabaseMatches} utility database records</div>
              <div>• Historical performance: {(accuracyMetrics.historicalAccuracy * 100).toFixed(1)}% accuracy on similar infrastructure</div>
              <div>• Overall quality grade: {accuracyMetrics.qualityGrade} - {accuracyMetrics.qualityGrade.startsWith('A') ? 'suitable for investment decisions' : 'suitable for preliminary analysis'}</div>
            </div>
          </div>

          {/* Confidence Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold">Confidence Level Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Ensemble AI Confidence</span>
                <span className={`font-medium ${getConfidenceLevel(accuracyMetrics.ensembleConfidence).color}`}>
                  {getConfidenceLevel(accuracyMetrics.ensembleConfidence).level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cross-Model Agreement</span>
                <span className={`font-medium ${getConfidenceLevel(accuracyMetrics.modelAgreement).color}`}>
                  {getConfidenceLevel(accuracyMetrics.modelAgreement).level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Historical Performance</span>
                <span className={`font-medium ${getConfidenceLevel(accuracyMetrics.historicalAccuracy).color}`}>
                  {getConfidenceLevel(accuracyMetrics.historicalAccuracy).level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
