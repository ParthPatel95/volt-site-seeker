import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Zap, AlertCircle } from 'lucide-react';

const suggestions = [
  {
    icon: TrendingUp,
    text: "What's driving the current price trend?",
    query: "Analyze the current price trend and tell me what factors are driving it. Include specific data points."
  },
  {
    icon: Clock,
    text: "Best trading window for next 6 hours?",
    query: "Based on the current data and historical patterns, when would be the optimal time to trade in the next 6 hours? Provide specific time recommendations."
  },
  {
    icon: Zap,
    text: "Renewable generation impact on prices",
    query: "How is renewable generation affecting current electricity prices? What correlation do you see?"
  },
  {
    icon: AlertCircle,
    text: "Any price spikes or risks ahead?",
    query: "Are there any indicators of potential price spikes or risks in the near future? What should I watch for?"
  }
];

interface QuickSuggestionsPanelProps {
  onSelectSuggestion: (query: string) => void;
}

export function QuickSuggestionsPanel({ onSelectSuggestion }: QuickSuggestionsPanelProps) {
  return (
    <Card className="mb-4 bg-gradient-to-br from-primary/10 to-background">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Quick Questions</h4>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, idx) => {
            const Icon = suggestion.icon;
            return (
              <Button
                key={idx}
                variant="ghost"
                className="justify-start h-auto py-2 px-3 text-left hover:bg-primary/10"
                onClick={() => onSelectSuggestion(suggestion.query)}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{suggestion.text}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
