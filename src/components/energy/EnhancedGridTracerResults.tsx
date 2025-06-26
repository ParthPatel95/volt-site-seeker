
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock,
  Cpu,
  Eye,
  Satellite,
  TrendingUp,
  DollarSign,
  Shield,
  Database
} from 'lucide-react';
import { EnhancedGridTracerResults as EnhancedResults, EnhancedDetectedInfrastructure } from '@/hooks/useEnhancedGridLineTracer';
import { EnhancedGridTracerInput } from './EnhancedGridLineTracer';

interface EnhancedGridTracerResultsProps {
  results: EnhancedResults;
  input: EnhancedGridTracerInput;
}

export function EnhancedGridTracerResults({ results, input }: EnhancedGridTracerResultsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'congested': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'full': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'congested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown';
    return `${distance.toFixed(1)} km`;
  };

  const formatCurrency = (amount?: number, currency: 'CAD' | 'USD' = 'CAD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAISourceIcon = (source?: string) => {
    if (source?.includes('Roboflow')) return <Cpu className="h-3 w-3 text-blue-500" />;
    if (source?.includes('OpenAI')) return <Eye className="h-3 w-3 text-purple-500" />;
    return <Satellite className="h-3 w-3 text-gray-500" />;
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-green-600';
    if (risk <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced AI Analysis Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Cpu className="h-5 w-5" />
            Enhanced Multi-AI Analysis Summary
            <Badge variant="secondary" className="ml-2">
              <Database className="h-3 w-3 mr-1" />
              Multi-Model Validation
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span className="font-medium">AI Models Used:</span>
              <Badge variant="secondary">{results.analysisMetadata.aiModelsUsed.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="font-medium">Database Cross-Check:</span>
              <Badge variant={results.analysisMetadata.utilityDatabaseCrossCheck ? "default" : "outline"}>
                {results.analysisMetadata.utilityDatabaseCrossCheck ? 'Verified' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Live Market Data:</span>
              <Badge variant={results.analysisMetadata.marketDataIncluded ? "default" : "outline"}>
                {results.analysisMetadata.marketDataIncluded ? 'Integrated' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Accuracy Grade:</span>
              <Badge variant="outline">{results.accuracyMetrics?.qualityGrade || 'A'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Substations</p>
                <p className="text-2xl font-bold">{results.summary.totalSubstations}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Capacity</p>
                <p className="text-2xl font-bold">{results.summary.totalAvailableCapacity}MW</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connection Cost</p>
                <p className="text-lg font-bold">{formatCurrency(results.summary.averageConnectionCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold">
                  {(results.analysisMetadata.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grid Health</p>
                <Badge 
                  className={`mt-1 ${
                    results.summary.estimatedGridHealth === 'good' 
                      ? 'bg-green-100 text-green-800' 
                      : results.summary.estimatedGridHealth === 'moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {results.summary.estimatedGridHealth}
                </Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Market Analysis */}
      {results.marketAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Market Analysis - {results.marketAnalysis.currentMarket}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Current Rate</p>
                <p className="text-xl font-bold text-blue-600">
                  {results.marketAnalysis.liveRates.current.toFixed(2)}¢/kWh
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Peak Rate</p>
                <p className="text-xl font-bold text-red-600">
                  {results.marketAnalysis.liveRates.peak.toFixed(2)}¢/kWh
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Off-Peak Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {results.marketAnalysis.liveRates.offPeak.toFixed(2)}¢/kWh
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Monthly Est. ({input.powerRequirement}MW)</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(results.marketAnalysis.projectedMonthlyCost, results.marketAnalysis.liveRates.currency)}
                </p>
              </div>
            </div>
            
            {results.marketAnalysis.rateStructure && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">{results.marketAnalysis.rateStructure.customerClass} Rate Structure:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div>Energy: {results.marketAnalysis.rateStructure.energyCharge.toFixed(2)}¢/kWh</div>
                  <div>Demand: ${results.marketAnalysis.rateStructure.demandCharge.toFixed(2)}/kW/mo</div>
                  <div>Transmission: {results.marketAnalysis.rateStructure.transmissionCharge.toFixed(2)}¢/kWh</div>
                  <div>Distribution: {results.marketAnalysis.rateStructure.distributionCharge.toFixed(2)}¢/kWh</div>
                  <div>Riders: {results.marketAnalysis.rateStructure.riders.toFixed(2)}¢/kWh</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Infrastructure List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Enhanced AI-Detected Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.detectedInfrastructure.map((item) => (
              <div key={item.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="capitalize">
                        {item.type.replace('_', ' ')}
                      </Badge>
                      {item.estimatedCapacity && (
                        <Badge className={getStatusColor(item.estimatedCapacity.status)}>
                          {getStatusIcon(item.estimatedCapacity.status)}
                          <span className="ml-1">{item.estimatedCapacity.status}</span>
                        </Badge>
                      )}
                      {item.multiModelConfidence && (
                        <Badge variant="secondary">
                          {(item.multiModelConfidence.ensemble * 100).toFixed(0)}% ensemble confidence
                        </Badge>
                      )}
                      {item.properties?.source && (
                        <Badge variant="outline" className="text-xs">
                          {getAISourceIcon(item.properties.source)}
                          <span className="ml-1">Multi-AI Detection</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* Technical Details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Technical Details</h4>
                    {item.properties?.name && (
                      <div><span className="font-medium">Name:</span> {item.properties.name}</div>
                    )}
                    {item.properties?.voltage && (
                      <div><span className="font-medium">Voltage:</span> {item.properties.voltage}</div>
                    )}
                    {item.properties?.circuits && (
                      <div><span className="font-medium">Circuits:</span> {item.properties.circuits}</div>
                    )}
                    {item.estimatedCapacity && (
                      <div><span className="font-medium">Capacity Tier:</span> {item.estimatedCapacity.tier}</div>
                    )}
                    <div><span className="font-medium">Distance:</span> {formatDistance(item.properties?.distance)}</div>
                  </div>

                  {/* Market Data */}
                  {item.marketData && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Market Rates</h4>
                      {item.marketData.currentRateCAD && (
                        <div><span className="font-medium">Current Rate:</span> {item.marketData.currentRateCAD.toFixed(2)}¢/kWh CAD</div>
                      )}
                      {item.marketData.currentRateUSD && (
                        <div><span className="font-medium">Current Rate:</span> {item.marketData.currentRateUSD.toFixed(2)}¢/kWh USD</div>
                      )}
                      {item.marketData.demandCharge && (
                        <div><span className="font-medium">Demand Charge:</span> ${item.marketData.demandCharge.toFixed(2)}/kW/mo</div>
                      )}
                      {item.properties?.estimatedConnectionCost && (
                        <div><span className="font-medium">Connection Cost:</span> {formatCurrency(item.properties.estimatedConnectionCost)}</div>
                      )}
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {item.riskAssessment && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Risk Assessment</h4>
                      <div><span className="font-medium">Seismic Risk:</span> 
                        <Badge variant="outline" className="ml-1 text-xs">{item.riskAssessment.seismicRisk}</Badge>
                      </div>
                      <div><span className="font-medium">Weather Risk:</span> 
                        <Badge variant="outline" className="ml-1 text-xs">{item.riskAssessment.weatherRisk}</Badge>
                      </div>
                      <div><span className="font-medium">Regulatory Risk:</span> 
                        <Badge variant="outline" className="ml-1 text-xs">{item.riskAssessment.regulatoryRisk}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Overall Risk:</span> 
                        <span className={`font-bold ${getRiskColor(item.riskAssessment.overallRisk)}`}>
                          {item.riskAssessment.overallRisk}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-Model Confidence Breakdown */}
                {item.multiModelConfidence && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium mb-2 text-blue-800">Multi-AI Model Confidence</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="flex justify-between">
                          <span>Roboflow:</span>
                          <span className="font-medium">{(item.multiModelConfidence.roboflow * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={item.multiModelConfidence.roboflow * 100} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span>OpenAI:</span>
                          <span className="font-medium">{(item.multiModelConfidence.openai * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={item.multiModelConfidence.openai * 100} className="h-2 mt-1" />
                      </div>
                      {item.multiModelConfidence.google && (
                        <div>
                          <div className="flex justify-between">
                            <span>Google:</span>
                            <span className="font-medium">{(item.multiModelConfidence.google * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={item.multiModelConfidence.google * 100} className="h-2 mt-1" />
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Ensemble:</span>
                          <span className="font-bold">{(item.multiModelConfidence.ensemble * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={item.multiModelConfidence.ensemble * 100} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Environmental Constraints */}
                {item.properties?.environmentalConstraints && item.properties.environmentalConstraints.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-sm font-medium text-yellow-800">Environmental Considerations:</p>
                    <ul className="text-xs text-yellow-700 mt-1">
                      {item.properties.environmentalConstraints.map((constraint, idx) => (
                        <li key={idx}>• {constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      {results.predictiveAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Predictive Analytics & Investment Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Future Grid Expansion</h4>
                {results.predictiveAnalytics.futureGridExpansion.map((expansion, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg mb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{expansion.capacity}MW Expansion</span>
                      <Badge variant="outline">{(expansion.probability * 100).toFixed(0)}% probability</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Expected in {expansion.timeframe}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Investment Recommendation</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">
                    {results.predictiveAnalytics.optimalInvestmentTiming.recommendation}
                  </p>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Expected ROI:</span> {(results.predictiveAnalytics.optimalInvestmentTiming.expectedROI * 100).toFixed(1)}%</div>
                    <div className="mt-2">
                      <span className="font-medium">Risk Factors:</span>
                      <ul className="text-xs mt-1 ml-4">
                        {results.predictiveAnalytics.optimalInvestmentTiming.riskFactors.map((factor, idx) => (
                          <li key={idx}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Enhanced AI Analysis Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium mb-2">Scan Parameters:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Center: {results.scanArea.center[1].toFixed(4)}, {results.scanArea.center[0].toFixed(4)}</li>
                <li>Radius: {results.scanArea.radius} km</li>
                <li>Power Requirement: {input.powerRequirement}MW</li>
                <li>Customer Class: {input.customerClass}</li>
                <li>Market Analysis: {input.enableMarketAnalysis ? 'Enabled' : 'Disabled'}</li>
                <li>Accuracy Enhancement: {input.enableAccuracyEnhancement ? 'Enabled' : 'Disabled'}</li>
                {input.targetSite && <li>Target Site: {input.targetSite}</li>}
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">Enhanced AI Analysis Details:</p>
              <ul className="space-y-1 text-gray-600">
                <li>Timestamp: {new Date(results.analysisMetadata.scanTimestamp).toLocaleString()}</li>
                <li>Imagery Sources: {results.analysisMetadata.satelliteImagerySource}</li>
                <li>AI Models: {results.analysisMetadata.aiModelsUsed.length} models used</li>
                <li>Overall Confidence: {(results.analysisMetadata.confidenceScore * 100).toFixed(1)}%</li>
                <li>Utility DB Cross-Check: {results.analysisMetadata.utilityDatabaseCrossCheck ? 'Verified' : 'Not Available'}</li>
                <li>Quality Grade: {results.accuracyMetrics?.qualityGrade || 'A'}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Enhanced Multi-AI Analysis Confidence</span>
              <span className="text-sm text-gray-600">
                {(results.analysisMetadata.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={results.analysisMetadata.confidenceScore * 100} className="w-full" />
            
            <div className="mt-3 text-xs text-gray-500">
              <p>AI Models Used: {results.analysisMetadata.aiModelsUsed.join(' • ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
