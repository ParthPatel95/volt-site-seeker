
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Home, Users, Zap } from 'lucide-react';

interface BTCROIMiningSelectorProps {
  mode: 'hosting' | 'self';
  onModeChange: (mode: 'hosting' | 'self') => void;
}

export const BTCROIMiningModeSelector: React.FC<BTCROIMiningSelectorProps> = ({ 
  mode, 
  onModeChange 
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Choose Your Mining Strategy
        </h3>
        <p className="text-sm text-gray-600">
          Select your business model
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Hosting Business Option */}
        <div 
          className={`relative rounded-lg border-2 transition-all cursor-pointer ${
            mode === 'hosting' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
          }`}
          onClick={() => onModeChange('hosting')}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-lg ${
                  mode === 'hosting' ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  <Building className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base text-gray-900">
                    Hosting Business
                  </h4>
                  <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Calculate profits from hosting miners for clients
                </p>
              </div>
              {mode === 'hosting' && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Self-Mining Option */}
        <div 
          className={`relative rounded-lg border-2 transition-all cursor-pointer ${
            mode === 'self' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
          }`}
          onClick={() => onModeChange('self')}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`p-2 rounded-lg ${
                  mode === 'self' ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  <Home className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base text-gray-900">
                    Self-Mining
                  </h4>
                  <Zap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Calculate ROI for your own mining operation
                </p>
              </div>
              {mode === 'self' && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mode Description */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        {mode === 'hosting' ? (
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Hosting Business Mode
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Perfect for facilities that host miners for clients. Calculate your revenue from hosting fees 
              minus your electricity costs and operational expenses.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-green-800 mb-2">
              Self-Mining Mode
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ideal for individual miners or businesses mining for themselves. Calculate your mining 
              revenue minus hardware costs, electricity, and operational expenses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
