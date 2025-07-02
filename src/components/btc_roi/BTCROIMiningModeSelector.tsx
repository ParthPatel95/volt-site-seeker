
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
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your Mining Strategy</h3>
        <p className="text-sm text-gray-600">Select the calculation mode that matches your business model</p>
      </div>
      
      <div className="space-y-3">
        <Button
          variant={mode === 'hosting' ? 'default' : 'outline'}
          onClick={() => onModeChange('hosting')}
          className={`w-full p-4 h-auto flex flex-col items-center gap-3 transition-all duration-200 ${
            mode === 'hosting' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
              : 'hover:bg-blue-50 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 flex-shrink-0" />
            <Users className="w-4 h-4 flex-shrink-0" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-base mb-1">Hosting Business</div>
            <div className="text-xs opacity-90 leading-tight">
              Calculate profits from hosting miners for clients
            </div>
          </div>
        </Button>
        
        <Button
          variant={mode === 'self' ? 'default' : 'outline'}
          onClick={() => onModeChange('self')}
          className={`w-full p-4 h-auto flex flex-col items-center gap-3 transition-all duration-200 ${
            mode === 'self' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
              : 'hover:bg-green-50 hover:border-green-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 flex-shrink-0" />
            <Zap className="w-4 h-4 flex-shrink-0" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-base mb-1">Self-Mining</div>
            <div className="text-xs opacity-90 leading-tight">
              Calculate ROI for your own mining operation
            </div>
          </div>
        </Button>
      </div>
      
      {/* Mode Description */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        {mode === 'hosting' ? (
          <div className="text-center">
            <h4 className="font-medium text-blue-800 mb-2">Hosting Business Mode</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Perfect for facilities that host miners for clients. Calculate your revenue from hosting fees 
              minus your electricity costs and operational expenses.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h4 className="font-medium text-green-800 mb-2">Self-Mining Mode</h4>
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
