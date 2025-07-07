import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketPortfolio } from '@/hooks/useVoltMarketPortfolio';
import { 
  Briefcase, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  PieChart, 
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';

export const VoltMarketPortfolioManager: React.FC = () => {
  const { portfolios, loading, createPortfolio, addPortfolioItem, getPortfolioItems, analyzePortfolio, deletePortfolio } = useVoltMarketPortfolio();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  // Create portfolio form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    portfolioType: 'investment',
    riskTolerance: 'moderate'
  });

  // Add item form state
  const [addItemForm, setAddItemForm] = useState({
    name: '',
    itemType: 'listing',
    acquisitionPrice: '',
    currentValue: '',
    acquisitionDate: '',
    notes: '',
    listingId: ''
  });

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioDetails(selectedPortfolio);
    }
  }, [selectedPortfolio]);

  const loadPortfolioDetails = async (portfolioId: string) => {
    try {
      const [items, analyticsData] = await Promise.all([
        getPortfolioItems(portfolioId),
        analyzePortfolio(portfolioId)
      ]);
      setPortfolioItems(items);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading portfolio details:', error);
    }
  };

  const handleCreatePortfolio = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createPortfolio({
        name: createForm.name,
        description: createForm.description,
        portfolioType: createForm.portfolioType as any,
        riskTolerance: createForm.riskTolerance as any
      });
      
      toast({
        title: "Portfolio created",
        description: "Your new portfolio has been created successfully"
      });
      
      setCreateForm({
        name: '',
        description: '',
        portfolioType: 'investment',
        riskTolerance: 'moderate'
      });
      setShowCreateForm(false);
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create portfolio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPortfolio) return;

    try {
      await addPortfolioItem({
        portfolioId: selectedPortfolio,
        name: addItemForm.name,
        itemType: addItemForm.itemType as any,
        acquisitionPrice: addItemForm.acquisitionPrice ? parseFloat(addItemForm.acquisitionPrice) : undefined,
        currentValue: addItemForm.currentValue ? parseFloat(addItemForm.currentValue) : undefined,
        acquisitionDate: addItemForm.acquisitionDate || undefined,
        notes: addItemForm.notes || undefined,
        listingId: addItemForm.listingId || undefined
      });
      
      toast({
        title: "Item added",
        description: "Item has been added to your portfolio"
      });
      
      setAddItemForm({
        name: '',
        itemType: 'listing',
        acquisitionPrice: '',
        currentValue: '',
        acquisitionDate: '',
        notes: '',
        listingId: ''
      });
      setShowAddItemForm(false);
      
      // Reload portfolio details
      if (selectedPortfolio) {
        loadPortfolioDetails(selectedPortfolio);
      }
    } catch (error) {
      toast({
        title: "Failed to add item",
        description: "Failed to add item to portfolio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePortfolio = async (portfolioId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete portfolio "${name}"?`)) return;
    
    try {
      await deletePortfolio(portfolioId);
      toast({
        title: "Portfolio deleted",
        description: "Portfolio has been deleted successfully"
      });
      
      if (selectedPortfolio === portfolioId) {
        setSelectedPortfolio(null);
        setPortfolioItems([]);
        setAnalytics(null);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete portfolio",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const selectedPortfolioData = portfolios.find(p => p.id === selectedPortfolio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Manager</h1>
            <p className="text-gray-600 mt-1">Track and analyze your energy infrastructure investments</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePortfolio} className="space-y-4">
                <div>
                  <Label htmlFor="name">Portfolio Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio-type">Portfolio Type</Label>
                  <Select value={createForm.portfolioType} onValueChange={(value) => setCreateForm(prev => ({ ...prev, portfolioType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="trading">Trading</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                  <Select value={createForm.riskTolerance} onValueChange={(value) => setCreateForm(prev => ({ ...prev, riskTolerance: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="speculative">Speculative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Portfolio</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Portfolio Selection */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle>Your Portfolios ({portfolios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPortfolio === portfolio.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{portfolio.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePortfolio(portfolio.id, portfolio.name);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{portfolio.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Value:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(portfolio.total_value || 0)}
                      </span>
                    </div>
                    {portfolio.metrics && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Items:</span>
                          <span>{portfolio.metrics.totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Return:</span>
                          <span className={portfolio.metrics.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {portfolio.metrics.returnPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <Badge className="mt-2" variant="outline">
                    {portfolio.portfolio_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Details */}
        {selectedPortfolioData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="holdings">Holdings ({portfolioItems.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(selectedPortfolioData.total_value || 0)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                {selectedPortfolioData.metrics && (
                  <>
                    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Return</p>
                            <p className={`text-2xl font-bold ${selectedPortfolioData.metrics.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedPortfolioData.metrics.returnPercentage.toFixed(1)}%
                            </p>
                          </div>
                          {selectedPortfolioData.metrics.returnPercentage >= 0 ? (
                            <TrendingUp className="w-8 h-8 text-green-500" />
                          ) : (
                            <TrendingDown className="w-8 h-8 text-red-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Active Holdings</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {selectedPortfolioData.metrics.activeItems}
                            </p>
                          </div>
                          <Briefcase className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Portfolio Items</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {selectedPortfolioData.metrics.totalItems}
                            </p>
                          </div>
                          <PieChart className="w-8 h-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="holdings">
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Portfolio Holdings</CardTitle>
                    <Dialog open={showAddItemForm} onOpenChange={setShowAddItemForm}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Portfolio Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div>
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input
                              id="item-name"
                              value={addItemForm.name}
                              onChange={(e) => setAddItemForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="item-type">Type</Label>
                            <Select value={addItemForm.itemType} onValueChange={(value) => setAddItemForm(prev => ({ ...prev, itemType: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="listing">Listing</SelectItem>
                                <SelectItem value="investment">Investment</SelectItem>
                                <SelectItem value="opportunity">Opportunity</SelectItem>
                                <SelectItem value="research">Research</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="acquisition-price">Acquisition Price</Label>
                              <Input
                                id="acquisition-price"
                                type="number"
                                value={addItemForm.acquisitionPrice}
                                onChange={(e) => setAddItemForm(prev => ({ ...prev, acquisitionPrice: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="current-value">Current Value</Label>
                              <Input
                                id="current-value"
                                type="number"
                                value={addItemForm.currentValue}
                                onChange={(e) => setAddItemForm(prev => ({ ...prev, currentValue: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="acquisition-date">Acquisition Date</Label>
                            <Input
                              id="acquisition-date"
                              type="date"
                              value={addItemForm.acquisitionDate}
                              onChange={(e) => setAddItemForm(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={addItemForm.notes}
                              onChange={(e) => setAddItemForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddItemForm(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Item</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {portfolioItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</h3>
                      <p className="text-gray-600 mb-4">Add your first investment to start tracking performance</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {portfolioItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <Badge variant="outline">{item.item_type}</Badge>
                              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {item.acquisition_price && (
                                <span>Acquired: {formatCurrency(item.acquisition_price)}</span>
                              )}
                              {item.current_value && (
                                <span>Current: {formatCurrency(item.current_value)}</span>
                              )}
                              {item.acquisition_date && (
                                <span>Date: {new Date(item.acquisition_date).toLocaleDateString()}</span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.acquisition_price && item.current_value && (
                              <div className="text-right mr-4">
                                <div className={`text-sm font-semibold ${
                                  item.current_value >= item.acquisition_price ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {((item.current_value - item.acquisition_price) / item.acquisition_price * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(item.current_value - item.acquisition_price)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Portfolio Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-blue-800 mb-2">Performance</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Return:</span>
                              <span className="font-semibold">{formatCurrency(analytics.performance.totalReturn)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Return %:</span>
                              <span className="font-semibold">{analytics.performance.returnPercentage.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Item Value:</span>
                              <span className="font-semibold">{formatCurrency(analytics.performance.avgItemValue)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-green-800 mb-2">Risk Assessment</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Risk Score:</span>
                              <span className="font-semibold">{analytics.risk.averageRiskScore.toFixed(1)}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tolerance:</span>
                              <span className="font-semibold capitalize">{analytics.risk.riskTolerance}</span>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs text-green-700">{analytics.risk.recommendation}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h3 className="font-semibold text-purple-800 mb-2">Allocation</h3>
                          <div className="space-y-1 text-sm">
                            {Object.entries(analytics.allocation.byType).map(([type, value]) => (
                              <div key={type} className="flex justify-between">
                                <span className="capitalize">{type}:</span>
                                <span className="font-semibold">{formatCurrency(value as number)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {analytics.recommendations && analytics.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                          <div className="space-y-2">
                            {analytics.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-yellow-800">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics available</h3>
                      <p className="text-gray-600">Add some items to your portfolio to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Tracking</h3>
                    <p className="text-gray-600">Performance charts and historical data will be available soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};