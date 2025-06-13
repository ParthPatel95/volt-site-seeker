
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, RefreshCw } from 'lucide-react';

interface CompanyAnalysisFormProps {
  onAnalyze: (company: string, ticker: string) => Promise<void>;
  loading: boolean;
}

export function CompanyAnalysisForm({ onAnalyze, loading }: CompanyAnalysisFormProps) {
  const [newCompany, setNewCompany] = useState('');
  const [newTicker, setNewTicker] = useState('');

  const handleAnalyze = async () => {
    if (newCompany.trim()) {
      await onAnalyze(newCompany.trim(), newTicker.trim());
      setNewCompany('');
      setNewTicker('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCompany.trim()) {
      handleAnalyze();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Company Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            placeholder="Company name"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={loading}
          />
          <Input
            placeholder="Ticker (optional)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-32"
            disabled={loading}
          />
          <Button onClick={handleAnalyze} disabled={loading || !newCompany.trim()}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
