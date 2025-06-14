
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart } from 'lucide-react';

interface PortfolioOptimizationFormProps {
  onOptimize: (portfolioSize: number, riskTolerance: string) => void;
  isOptimizing: boolean;
}

export function PortfolioOptimizationForm({ onOptimize, isOptimizing }: PortfolioOptimizationFormProps) {
  const [portfolioSize, setPortfolioSize] = useState('10');
  const [riskTolerance, setRiskTolerance] = useState('moderate');

  const handleOptimize = () => {
    onOptimize(parseInt(portfolioSize), riskTolerance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Portfolio Recommendations</CardTitle>
        <CardDescription>
          Optimize your investment portfolio using AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Portfolio Size</label>
            <Input
              type="number"
              placeholder="Number of companies"
              value={portfolioSize}
              onChange={(e) => setPortfolioSize(e.target.value)}
              min="5"
              max="50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleOptimize} disabled={isOptimizing} className="w-full">
              {isOptimizing ? 'Optimizing...' : 'Optimize Portfolio'}
              <PieChart className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
