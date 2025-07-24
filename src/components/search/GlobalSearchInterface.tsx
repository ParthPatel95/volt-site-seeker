import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, MapPin, Zap, Building, TrendingUp, Calendar, DollarSign, X, Clock, Bookmark, ArrowRight, FileText, Users, Activity, Database, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'listing' | 'company' | 'property' | 'insight' | 'document' | 'user' | 'calculation' | 'alert' | 'news';
  title: string;
  description: string;
  metadata: any;
  relevanceScore: number;
  timestamp?: Date;
  location?: string;
  value?: number;
  tags: string[];
  url?: string;
  source?: string;
}

interface SearchFilters {
  types: string[];
  location: string;
  priceRange: [number, number];
  capacityRange: [number, number];
  dateRange: [Date | null, Date | null];
  tags: string[];
  status: string[];
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
  count?: number;
}

export function GlobalSearchInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    location: '',
    priceRange: [0, 10000000],
    capacityRange: [0, 1000],
    dateRange: [null, null],
    tags: [],
    status: []
  });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else if (query.length === 0) {
      setResults([]);
      loadSuggestions();
    }
  }, [query, filters]);

  useEffect(() => {
    loadRecentSearches();
    loadSavedSearches();
  }, []);

  const loadSuggestions = async () => {
    try {
      // Load real suggestions from various tables
      const { data: companies } = await supabase
        .from('companies')
        .select('name')
        .limit(5);
      
      const { data: properties } = await supabase
        .from('properties')
        .select('address, city, state')
        .limit(5);

      const suggestions: SearchSuggestion[] = [
        // Add company-based suggestions
        ...(companies || []).map((company, index) => ({
          id: `company-${index}`,
          text: company.name,
          type: 'suggestion' as const
        })),
        // Add location-based suggestions
        ...(properties || []).slice(0, 3).map((property, index) => ({
          id: `location-${index}`,
          text: `${property.city}, ${property.state}`,
          type: 'suggestion' as const
        })),
        // Popular search terms
        { id: 'pop-1', text: 'solar energy', type: 'popular', count: 127 },
        { id: 'pop-2', text: 'wind power', type: 'popular', count: 89 },
        { id: 'pop-3', text: 'battery storage', type: 'popular', count: 76 },
        // Recent searches
        ...recentSearches.slice(0, 3).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: 'recent' as const
        }))
      ];
      
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Fallback to basic suggestions
      setSuggestions([
        { id: '1', text: 'solar energy', type: 'popular', count: 127 },
        { id: '2', text: 'wind power', type: 'popular', count: 89 },
        { id: '3', text: 'energy storage', type: 'popular', count: 76 }
      ]);
      setShowSuggestions(true);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchTerm = query.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search VoltMarket listings
      const { data: listings } = await supabase
        .from('voltmarket_listings')
        .select(`
          *,
          voltmarket_profiles!seller_id(company_name)
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .limit(10);

      if (listings) {
        listings.forEach(listing => {
          allResults.push({
            id: listing.id,
            type: 'listing',
            title: listing.title,
            description: listing.description || '',
            metadata: {
              capacity: listing.available_power_mw || 0,
              price: listing.asking_price,
              location: listing.location,
              status: listing.status,
              listingType: listing.listing_type,
              seller: listing.voltmarket_profiles?.company_name,
              equipmentType: listing.equipment_type
            },
            relevanceScore: calculateRelevanceScore(searchTerm, listing.title, listing.description),
            timestamp: new Date(listing.created_at),
            location: listing.location,
            value: listing.asking_price,
            tags: [listing.listing_type, listing.equipment_type, 'voltmarket'].filter(Boolean),
            url: `/voltmarket/listing/${listing.id}`
          });
        });
      }

      // Search companies
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%`)
        .limit(10);

      if (companies) {
        companies.forEach(company => {
          allResults.push({
            id: company.id,
            type: 'company',
            title: company.name,
            description: `${company.industry} company in ${company.sector} sector`,
            metadata: {
              marketCap: company.market_cap,
              industry: company.industry,
              sector: company.sector,
              ticker: company.ticker,
              financialHealth: company.financial_health_score
            },
            relevanceScore: calculateRelevanceScore(searchTerm, company.name, company.industry),
            location: company.locations ? Object.keys(company.locations)[0] : '',
            tags: [company.industry, company.sector, 'corporate'].filter(Boolean),
            url: `/app/corporate-intelligence?company=${company.id}`
          });
        });
      }

      // Search properties
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10);

      if (properties) {
        properties.forEach(property => {
          allResults.push({
            id: property.id,
            type: 'property',
            title: `${property.address}`,
            description: property.description || `${property.property_type} property in ${property.city}, ${property.state}`,
            metadata: {
              propertyType: property.property_type,
              squareFootage: property.square_footage,
              lotSize: property.lot_size_acres,
              askingPrice: property.asking_price,
              powerCapacity: property.power_capacity_mw,
              zoning: property.zoning
            },
            relevanceScore: calculateRelevanceScore(searchTerm, property.address, property.description),
            location: `${property.city}, ${property.state}`,
            value: property.asking_price,
            tags: [property.property_type, property.state, 'real-estate'].filter(Boolean)
          });
        });
      }

      // Search BTC ROI calculations
      const { data: calculations } = await supabase
        .from('btc_roi_calculations')
        .select('*')
        .or(`site_name.ilike.%${searchTerm}%,calculation_type.ilike.%${searchTerm}%`)
        .limit(5);

      if (calculations) {
        calculations.forEach(calc => {
          allResults.push({
            id: calc.id,
            type: 'calculation',
            title: `${calc.site_name} - ${calc.calculation_type}`,
            description: `Bitcoin mining ROI calculation for ${calc.site_name}`,
            metadata: {
              calculationType: calc.calculation_type,
              siteName: calc.site_name,
              results: calc.results
            },
            relevanceScore: calculateRelevanceScore(searchTerm, calc.site_name, calc.calculation_type),
            timestamp: new Date(calc.created_at),
            tags: ['bitcoin', 'mining', 'roi', 'calculation'],
            url: `/app/btc-roi-lab`
          });
        });
      }

      // Search documents (VoltMarket)
      const { data: documents } = await supabase
        .from('voltmarket_documents')
        .select('*')
        .or(`file_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,document_type.ilike.%${searchTerm}%`)
        .limit(10);

      if (documents) {
        documents.forEach(doc => {
          allResults.push({
            id: doc.id,
            type: 'document',
            title: doc.file_name,
            description: doc.description || `${doc.document_type} document`,
            metadata: {
              fileType: doc.file_type,
              fileSize: doc.file_size,
              documentType: doc.document_type,
              isPrivate: doc.is_private
            },
            relevanceScore: calculateRelevanceScore(searchTerm, doc.file_name, doc.description),
            timestamp: new Date(doc.created_at),
            tags: [doc.document_type, doc.file_type, 'document'].filter(Boolean),
            url: doc.file_url
          });
        });
      }

      // Search news intelligence
      const { data: news } = await supabase
        .from('news_intelligence')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(5);

      if (news) {
        news.forEach(article => {
          allResults.push({
            id: article.id,
            type: 'news',
            title: article.title,
            description: article.content?.substring(0, 200) + '...',
            metadata: {
              source: article.source,
              keywords: article.keywords,
              publishedAt: article.published_at
            },
            relevanceScore: calculateRelevanceScore(searchTerm, article.title, article.content),
            timestamp: new Date(article.discovered_at),
            tags: article.keywords || ['news'],
            source: article.source,
            url: article.url
          });
        });
      }

      // Search distress alerts
      const { data: alerts } = await supabase
        .from('distress_alerts')
        .select('*')
        .or(`company_name.ilike.%${searchTerm}%,alert_type.ilike.%${searchTerm}%`)
        .limit(5);

      if (alerts) {
        alerts.forEach(alert => {
          allResults.push({
            id: alert.id,
            type: 'alert',
            title: `${alert.company_name} - ${alert.alert_type}`,
            description: `Distress alert for ${alert.company_name}`,
            metadata: {
              alertType: alert.alert_type,
              distressLevel: alert.distress_level,
              powerCapacity: alert.power_capacity,
              potentialValue: alert.potential_value,
              signals: alert.signals
            },
            relevanceScore: calculateRelevanceScore(searchTerm, alert.company_name, alert.alert_type),
            timestamp: new Date(alert.created_at),
            value: alert.potential_value,
            tags: ['distress', 'alert', alert.alert_type],
            url: `/app/corporate-intelligence`
          });
        });
      }

      // Sort by relevance score
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setResults(allResults);
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        const updated = [query, ...recentSearches.slice(0, 9)];
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const calculateRelevanceScore = (searchTerm: string, title: string, description?: string) => {
    let score = 0;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerDescription = description?.toLowerCase() || '';

    // Exact title match gets highest score
    if (lowerTitle === lowerSearchTerm) score += 1.0;
    else if (lowerTitle.includes(lowerSearchTerm)) score += 0.8;
    
    // Title starts with search term
    if (lowerTitle.startsWith(lowerSearchTerm)) score += 0.6;
    
    // Description contains search term
    if (lowerDescription.includes(lowerSearchTerm)) score += 0.4;
    
    // Word boundary matches get higher scores
    const titleWords = lowerTitle.split(/\s+/);
    const searchWords = lowerSearchTerm.split(/\s+/);
    
    searchWords.forEach(searchWord => {
      if (titleWords.includes(searchWord)) score += 0.3;
    });

    return Math.min(score, 1.0);
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const saveSearch = () => {
    if (!query.trim() || savedSearches.includes(query)) return;
    
    const updated = [query, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    toast({
      title: "Search Saved",
      description: "Your search has been saved for quick access",
    });
  };

  const removeSavedSearch = (searchToRemove: string) => {
    const updated = savedSearches.filter(s => s !== searchToRemove);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast({
      title: "Recent searches cleared",
      description: "Your search history has been cleared",
    });
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing': return <Zap className="w-4 h-4" />;
      case 'company': return <Building className="w-4 h-4" />;
      case 'property': return <MapPin className="w-4 h-4" />;
      case 'insight': return <TrendingUp className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'calculation': return <Activity className="w-4 h-4" />;
      case 'alert': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'news': return <FileText className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatCapacity = (capacity: number) => {
    return `${capacity}MW`;
  };

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="space-y-4">
        {/* Search Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Global Search</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Search across listings, companies, properties, insights, and more
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search for power infrastructure, companies, insights..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length === 0 && loadSuggestions()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-20 h-12 text-base"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveSearch}
                  className="h-8"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" onClick={performSearch} disabled={!query.trim()}>
                Search
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md text-left"
                    >
                      <div className="flex items-center gap-3">
                        {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-muted-foreground" />}
                        {suggestion.type === 'popular' && <TrendingUp className="w-4 h-4 text-muted-foreground" />}
                        {suggestion.type === 'suggestion' && <Search className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-sm">{suggestion.text}</span>
                      </div>
                      {suggestion.count && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.count} results
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
                
                {recentSearches.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="h-6 text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.slice(0, 5).map((search, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleSuggestionClick({ id: '', text: search, type: 'recent' })}
                          >
                            {search}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Saved Searches</span>
                <Badge variant="secondary">{savedSearches.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((search, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSavedSearch(search)}
                      className="h-5 w-5 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Results */}
      {(query || results.length > 0) && (
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Searching across all platforms...</p>
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
                  <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                  <TabsTrigger value="listings">
                    Listings ({results.filter(r => r.type === 'listing').length})
                  </TabsTrigger>
                  <TabsTrigger value="companies">
                    Companies ({results.filter(r => r.type === 'company').length})
                  </TabsTrigger>
                  <TabsTrigger value="properties">
                    Properties ({results.filter(r => r.type === 'property').length})
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    Documents ({results.filter(r => r.type === 'document').length})
                  </TabsTrigger>
                  <TabsTrigger value="calculations">
                    Calculations ({results.filter(r => r.type === 'calculation').length})
                  </TabsTrigger>
                  <TabsTrigger value="alerts">
                    Alerts ({results.filter(r => r.type === 'alert').length})
                  </TabsTrigger>
                  <TabsTrigger value="news">
                    News ({results.filter(r => r.type === 'news').length})
                  </TabsTrigger>
                  <TabsTrigger value="insights">
                    Insights ({results.filter(r => r.type === 'insight').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => result.url && window.open(result.url, '_blank')}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{result.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {result.type}
                                </Badge>
                                {result.value && (
                                  <Badge variant="secondary">
                                    {formatValue(result.value)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-3">{result.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                              {result.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {result.location}
                                </div>
                              )}
                              {result.metadata?.capacity && (
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {formatCapacity(result.metadata.capacity)}
                                </div>
                              )}
                              {result.timestamp && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {result.timestamp.toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {result.tags.slice(0, 4).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {result.tags.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{result.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                View Details
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Tab contents for filtered results */}
                {['listings', 'companies', 'properties', 'documents', 'calculations', 'alerts', 'news', 'insights'].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    {results
                      .filter(r => r.type === type.slice(0, -1))
                      .map((result) => (
                        <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => result.url && window.open(result.url, '_blank')}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(result.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{result.title}</h3>
                                  {result.value && (
                                    <Badge variant="secondary">
                                      {formatValue(result.value)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-3">{result.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                  {result.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {result.location}
                                    </div>
                                  )}
                                  {result.source && (
                                    <div className="flex items-center gap-1">
                                      <Database className="w-3 h-3" />
                                      {result.source}
                                    </div>
                                  )}
                                  {result.timestamp && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {result.timestamp.toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {result.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          ) : query && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't find anything matching "{query}". Try adjusting your search terms.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('solar')}>
                    solar
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('wind')}>
                    wind
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('battery')}>
                    battery
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('texas')}>
                    texas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}