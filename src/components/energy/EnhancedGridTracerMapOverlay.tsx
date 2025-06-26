
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EnhancedGridTracerResults, EnhancedDetectedInfrastructure } from '@/hooks/useEnhancedGridLineTracer';

interface EnhancedGridTracerMapOverlayProps {
  results: EnhancedGridTracerResults;
  scanCenter: [number, number];
  scanRadius: number;
}

export function EnhancedGridTracerMapOverlay({ 
  results, 
  scanCenter, 
  scanRadius 
}: EnhancedGridTracerMapOverlayProps) {
  const getMarkerColor = (item: EnhancedDetectedInfrastructure) => {
    if (item.estimatedCapacity) {
      switch (item.estimatedCapacity.color) {
        case 'green': return '#10b981';
        case 'yellow': return '#f59e0b';
        case 'red': return '#ef4444';
        default: return '#6b7280';
      }
    }
    return '#6b7280';
  };

  const getMarkerSymbol = (type: string) => {
    switch (type) {
      case 'substation': return '⚡';
      case 'transmission_line': return '⚡';
      case 'tower': return '📡';
      default: return '📍';
    }
  };

  const getRiskIndicator = (risk?: number) => {
    if (!risk) return '';
    if (risk <= 30) return '🟢';
    if (risk <= 60) return '🟡';
    return '🔴';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Enhanced Scan Radius Circle */}
      <div 
        className="absolute border-2 border-blue-400 border-dashed rounded-full opacity-30"
        style={{
          width: `${scanRadius * 20}px`,
          height: `${scanRadius * 20}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Optimal Connection Indicator */}
      {results.summary.optimalConnectionPoint && (
        <div 
          className="absolute border-4 border-green-500 border-solid rounded-full opacity-50"
          style={{
            width: '40px',
            height: '40px',
            left: `${50 + (results.summary.optimalConnectionPoint.coordinates[0] - scanCenter[0]) * 1000}%`,
            top: `${50 - (results.summary.optimalConnectionPoint.coordinates[1] - scanCenter[1]) * 1000}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Enhanced Infrastructure Markers */}
      <div className="absolute inset-0">
        {results.detectedInfrastructure.map((item, index) => (
          <div
            key={item.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${50 + (item.coordinates[0] - scanCenter[0]) * 1000}%`,
              top: `${50 - (item.coordinates[1] - scanCenter[1]) * 1000}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer border-2 border-white"
                style={{ backgroundColor: getMarkerColor(item) }}
              >
                {getMarkerSymbol(item.type)}
              </div>
              
              {/* Risk Indicator */}
              {item.riskAssessment && (
                <div className="absolute -top-1 -right-1 text-xs">
                  {getRiskIndicator(item.riskAssessment.overallRisk)}
                </div>
              )}
              
              {/* Enhanced Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-3 bg-black text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 min-w-64">
                <div className="font-semibold text-sm mb-2">
                  {item.properties?.name || `${item.type.replace('_', ' ')}`}
                </div>
                
                {/* Technical Info */}
                <div className="space-y-1 mb-2">
                  {item.properties?.voltage && (
                    <div>Voltage: {item.properties.voltage}</div>
                  )}
                  {item.estimatedCapacity && (
                    <div>
                      Capacity: {item.estimatedCapacity.tier} 
                      <Badge 
                        className="ml-2 text-xs"
                        style={{ backgroundColor: getMarkerColor(item) }}
                      >
                        {item.estimatedCapacity.status}
                      </Badge>
                    </div>
                  )}
                  <div>Distance: {item.properties?.distance?.toFixed(1)} km</div>
                </div>

                {/* Multi-AI Confidence */}
                {item.multiModelConfidence && (
                  <div className="mb-2 text-xs">
                    <div>AI Confidence: {(item.multiModelConfidence.ensemble * 100).toFixed(0)}%</div>
                    <div className="text-gray-300">
                      Roboflow: {(item.multiModelConfidence.roboflow * 100).toFixed(0)}% | 
                      OpenAI: {(item.multiModelConfidence.openai * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {/* Market Data */}
                {item.marketData && (
                  <div className="mb-2 border-t border-gray-600 pt-2">
                    <div className="font-medium">Current Rates:</div>
                    {item.marketData.currentRateCAD && (
                      <div>{item.marketData.currentRateCAD.toFixed(2)}¢/kWh CAD</div>
                    )}
                    {item.marketData.currentRateUSD && (
                      <div>{item.marketData.currentRateUSD.toFixed(2)}¢/kWh USD</div>
                    )}
                    {item.properties?.estimatedConnectionCost && (
                      <div>Connection: ${(item.properties.estimatedConnectionCost / 1e6).toFixed(1)}M</div>
                    )}
                  </div>
                )}

                {/* Risk Assessment */}
                {item.riskAssessment && (
                  <div className="border-t border-gray-600 pt-2">
                    <div className="font-medium">Risk Level: {item.riskAssessment.overallRisk}/100</div>
                    <div className="text-gray-300 text-xs">
                      Seismic: {item.riskAssessment.seismicRisk} | 
                      Weather: {item.riskAssessment.weatherRisk} | 
                      Regulatory: {item.riskAssessment.regulatoryRisk}
                    </div>
                  </div>
                )}

                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg pointer-events-auto max-w-xs">
        <h4 className="text-sm font-semibold mb-3">Enhanced Grid Infrastructure</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">⚡</div>
            <span>Available Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">⚡</div>
            <span>Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">⚡</div>
            <span>At Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-dashed rounded-full"></div>
            <span>Scan Area ({scanRadius} km)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 border-solid rounded-full"></div>
            <span>Optimal Connection</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="flex items-center gap-1 mb-1">
              <span>Risk Indicators:</span>
            </div>
            <div className="space-y-1">
              <div>🟢 Low Risk (0-30)</div>
              <div>🟡 Medium Risk (31-60)</div>
              <div>🔴 High Risk (61-100)</div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          Multi-AI Detection | Live Market Data
        </div>
      </div>
    </div>
  );
}
