
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
    <div className="w-full max-w-full">
      <div className="text-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 break-words overflow-wrap-anywhere">
          Choose Your Mining Strategy
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed overflow-wrap-anywhere">
          Select the calculation mode that matches your business model
        </p>
      </div>
      
      <div className="space-y-3 max-w-full">
        <Button
          variant={mode === 'hosting' ? 'default' : 'outline'}
          onClick={() => onModeChange('hosting')}
          className={`w-full p-3 sm:p-4 h-auto flex flex-col items-center gap-2 transition-all duration-200 min-h-[90px] sm:min-h-[100px] max-w-full ${
            mode === 'hosting' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
              : 'hover:bg-blue-50 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1 flex-shrink-0">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="text-center space-y-1 w-full max-w-full overflow-hidden">
            <div className="font-semibold text-sm sm:text-base break-words overflow-wrap-anywhere">
              Hosting Business
            </div>
            <div className="text-xs opacity-90 leading-tight break-words overflow-wrap-anywhere px-1">
              Calculate profits from hosting miners for clients
            </div>
          </div>
        </Button>
        
        <Button
          variant={mode === 'self' ? 'default' : 'outline'}
          onClick={() => onModeChange('self')}
          className={`w-full p-3 sm:p-4 h-auto flex flex-col items-center gap-2 transition-all duration-200 min-h-[90px] sm:min-h-[100px] max-w-full ${
            mode === 'self' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
              : 'hover:bg-green-50 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1 flex-shrink-0">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="text-center space-y-1 w-full max-w-full overflow-hidden">
            <div className="font-semibold text-sm sm:text-base break-words overflow-wrap-anywhere">
              Self-Mining
            </div>
            <div className="text-xs opacity-90 leading-tight break-words overflow-wrap-anywhere px-1">
              Calculate ROI for your own mining operation
            </div>
          </div>
        </Button>
      </div>
      
      {/* Mode Description */}
      <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 max-w-full overflow-hidden">
        {mode === 'hosting' ? (
          <div className="text-center">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base break-words overflow-wrap-anywhere">
              Hosting Business Mode
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">
              Perfect for facilities that host miners for clients. Calculate your revenue from hosting fees 
              minus your electricity costs and operational expenses.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base break-words overflow-wrap-anywhere">
              Self-Mining Mode
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">
              Ideal for individual miners or businesses mining for themselves. Calculate your mining 
              revenue minus hardware costs, electricity, and operational expenses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
