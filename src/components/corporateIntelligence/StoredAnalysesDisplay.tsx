
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Calendar,
  Building2
} from 'lucide-react';
import { AIAnalysisDisplay } from './AIAnalysisDisplay';

interface StoredAnalysesDisplayProps {
  analyses: any[];
}

export function StoredAnalysesDisplay({ analyses }: StoredAnalysesDisplayProps) {
  if (!analyses || analyses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Recent AI Analyses ({analyses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-semibold">{analysis.company_name}</h4>
                {analysis.investment_recommendation && (
                  <Badge variant="outline">
                    {analysis.investment_recommendation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(analysis.analyzed_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-3">
              <AIAnalysisDisplay analysis={analysis} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
