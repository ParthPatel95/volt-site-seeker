import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Bell, Eye, Sparkles, TrendingUp } from 'lucide-react';

interface UserPreferences {
  dashboard_layout: 'compact' | 'detailed' | 'cards';
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  preferred_units: 'metric' | 'imperial';
  market_focus: string[];
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  auto_refresh: boolean;
  dark_mode: boolean;
  advanced_features: boolean;
}

interface PersonalizationSuggestion {
  type: 'dashboard' | 'notification' | 'workflow' | 'feature';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  action: string;
}

interface UserBehavior {
  most_used_features: string[];
  preferred_times: string[];
  search_patterns: string[];
  interaction_style: 'power_user' | 'casual' | 'explorer';
}

export const AdvancedPersonalization: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dashboard_layout: 'detailed',
    notification_frequency: 'hourly',
    preferred_units: 'metric',
    market_focus: ['ERCOT', 'AESO'],
    risk_tolerance: 'moderate',
    auto_refresh: true,
    dark_mode: false,
    advanced_features: true
  });

  const [suggestions, setSuggestions] = useState<PersonalizationSuggestion[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    most_used_features: ['Energy Trading', 'Risk Management', 'Market Data'],
    preferred_times: ['9:00 AM', '2:00 PM', '6:00 PM'],
    search_patterns: ['Bitcoin mining sites', 'Low energy rates', 'Grid capacity'],
    interaction_style: 'power_user'
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generatePersonalizationSuggestions = async () => {
    setLoading(true);
    try {
      // Simulate AI-powered personalization analysis
      const mockSuggestions: PersonalizationSuggestion[] = [
        {
          type: 'dashboard',
          title: 'Optimize Dashboard Layout',
          description: 'Based on your usage patterns, we recommend switching to a compact layout with your most-used widgets prioritized.',
          impact: 'high',
          confidence: 0.92,
          action: 'Apply suggested layout'
        },
        {
          type: 'notification',
          title: 'Smart Notification Timing',
          description: 'Set up notifications to arrive during your most active hours (9 AM, 2 PM, 6 PM) for better engagement.',
          impact: 'medium',
          confidence: 0.85,
          action: 'Enable smart timing'
        },
        {
          type: 'workflow',
          title: 'Automated Site Screening',
          description: 'Create automated workflows for your frequent search criteria to save time on repetitive tasks.',
          impact: 'high',
          confidence: 0.88,
          action: 'Set up automation'
        },
        {
          type: 'feature',
          title: 'Advanced Analytics Access',
          description: 'You qualify for beta access to our new predictive analytics features based on your power user activity.',
          impact: 'high',
          confidence: 0.95,
          action: 'Enable beta features'
        }
      ];

      setSuggestions(mockSuggestions);
      
      toast({
        title: "Personalization Analysis Complete",
        description: `Generated ${mockSuggestions.length} improvement suggestions`,
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate personalization suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePersonalizationSuggestions();
  }, []);

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Preference Updated",
      description: `${key.replace('_', ' ').toUpperCase()} has been updated`,
    });
  };

  const applySuggestion = (suggestion: PersonalizationSuggestion) => {
    // Simulate applying the suggestion
    toast({
      title: "Suggestion Applied",
      description: `${suggestion.title} has been implemented`,
    });
    
    // Remove the applied suggestion
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const color = confidence >= 0.9 ? 'bg-green-500' : confidence >= 0.7 ? 'bg-yellow-500' : 'bg-gray-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Personalization</h2>
          <p className="text-muted-foreground">AI-powered customization and user experience optimization</p>
        </div>
        <Button onClick={generatePersonalizationSuggestions} disabled={loading} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Refresh Suggestions
        </Button>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="behavior">User Insights</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Confidence Score</span>
                          <span className="text-xs font-semibold">{Math.round(suggestion.confidence * 100)}%</span>
                        </div>
                        {getConfidenceBar(suggestion.confidence)}
                      </div>

                      <Button 
                        onClick={() => applySuggestion(suggestion)} 
                        className="w-full" 
                        size="sm"
                      >
                        {suggestion.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dashboard Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Dashboard Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Layout Style</label>
                    <div className="flex gap-2">
                      {['compact', 'detailed', 'cards'].map((layout) => (
                        <Button
                          key={layout}
                          size="sm"
                          variant={preferences.dashboard_layout === layout ? 'default' : 'outline'}
                          onClick={() => updatePreference('dashboard_layout', layout)}
                        >
                          {layout}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto Refresh</label>
                    <Switch 
                      checked={preferences.auto_refresh}
                      onCheckedChange={(checked) => updatePreference('auto_refresh', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Advanced Features</label>
                    <Switch 
                      checked={preferences.advanced_features}
                      onCheckedChange={(checked) => updatePreference('advanced_features', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Frequency</label>
                    <div className="flex gap-2">
                      {['immediate', 'hourly', 'daily'].map((freq) => (
                        <Button
                          key={freq}
                          size="sm"
                          variant={preferences.notification_frequency === freq ? 'default' : 'outline'}
                          onClick={() => updatePreference('notification_frequency', freq)}
                        >
                          {freq}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Market Focus</label>
                    <div className="flex flex-wrap gap-2">
                      {['ERCOT', 'AESO', 'CAISO', 'PJM'].map((market) => (
                        <Badge
                          key={market}
                          variant={preferences.market_focus.includes(market) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newFocus = preferences.market_focus.includes(market)
                              ? preferences.market_focus.filter(m => m !== market)
                              : [...preferences.market_focus, market];
                            updatePreference('market_focus', newFocus);
                          }}
                        >
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk & Investment Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
                    <div className="flex gap-2">
                      {['conservative', 'moderate', 'aggressive'].map((risk) => (
                        <Button
                          key={risk}
                          size="sm"
                          variant={preferences.risk_tolerance === risk ? 'default' : 'outline'}
                          onClick={() => updatePreference('risk_tolerance', risk)}
                        >
                          {risk}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Units</label>
                    <div className="flex gap-2">
                      {['metric', 'imperial'].map((unit) => (
                        <Button
                          key={unit}
                          size="sm"
                          variant={preferences.preferred_units === unit ? 'default' : 'outline'}
                          onClick={() => updatePreference('preferred_units', unit)}
                        >
                          {unit}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Dark Mode</label>
                    <Switch 
                      checked={preferences.dark_mode}
                      onCheckedChange={(checked) => updatePreference('dark_mode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Most Used Features</div>
                    <div className="space-y-1">
                      {userBehavior.most_used_features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{feature}</span>
                          <Badge variant="secondary">{Math.floor(Math.random() * 50) + 10}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Peak Usage Hours</div>
                    <div className="space-y-1">
                      {userBehavior.preferred_times.map((time, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{time}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Common Searches</div>
                    <div className="space-y-1">
                      {userBehavior.search_patterns.map((pattern, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-sm text-muted-foreground">User Type</div>
                    <Badge className="mt-1 capitalize">
                      {userBehavior.interaction_style.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Custom Workflows & Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Custom Workflows</h3>
                  <p className="mb-4">Create automated workflows based on your preferences</p>
                  <Button>Create New Workflow</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};