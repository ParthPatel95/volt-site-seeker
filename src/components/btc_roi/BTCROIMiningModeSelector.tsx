
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
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800">Choose Your Mining Strategy</CardTitle>
        <p className="text-sm text-gray-600">Select the calculation mode that matches your business model</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant={mode === 'hosting' ? 'default' : 'outline'}
            onClick={() => onModeChange('hosting')}
            className={`h-24 flex flex-col gap-3 transition-all duration-200 ${
              mode === 'hosting' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105' 
                : 'hover:bg-blue-50 hover:border-blue-300 hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6" />
              <Users className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">Hosting Business</div>
              <div className="text-xs opacity-80">
                Calculate profits from hosting miners for clients
              </div>
            </div>
          </Button>
          
          <Button
            variant={mode === 'self' ? 'default' : 'outline'}
            onClick={() => onModeChange('self')}
            className={`h-24 flex flex-col gap-3 transition-all duration-200 ${
              mode === 'self' 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105' 
                : 'hover:bg-green-50 hover:border-green-300 hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">Self-Mining</div>
              <div className="text-xs opacity-80">
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
              <p className="text-sm text-gray-600">
                Perfect for facilities that host miners for clients. Calculate your revenue from hosting fees 
                minus your electricity costs and operational expenses.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h4 className="font-medium text-green-800 mb-2">Self-Mining Mode</h4>
              <p className="text-sm text-gray-600">
                Ideal for individual miners or businesses mining for themselves. Calculate your mining 
                revenue minus hardware costs, electricity, and operational expenses.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
