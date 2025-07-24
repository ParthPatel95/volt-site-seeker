import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, MapPin, Zap, Building, TrendingUp, Calendar, DollarSign, X, Clock, Bookmark, ArrowRight, FileText, Users, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  type: 'listing' | 'company' | 'property' | 'insight' | 'document' | 'user';
  title: string;
  description: string;
  metadata: any;
  relevanceScore: number;
  timestamp?: Date;
  location?: string;
  value?: number;
  tags: string[];
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

  const loadSuggestions = () => {
    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: 'solar farms texas', type: 'popular', count: 127 },
      { id: '2', text: 'wind energy alberta', type: 'popular', count: 89 },
      { id: '3', text: 'battery storage california', type: 'popular', count: 76 },
      { id: '4', text: 'natural gas plants', type: 'suggestion' },
      { id: '5', text: 'hydroelectric facilities', type: 'suggestion' },
      ...recentSearches.slice(0, 3).map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'recent' as const
      }))
    ];
    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Simulate API search with comprehensive results
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'listing' as const,
          title: 'Desert Sun Solar Farm',
          description: '500MW utility-scale solar facility in Arizona with battery storage',
          metadata: {
            capacity: 500,
            price: 1200000000,
            location: 'Arizona, USA',
            status: 'active',
            listingType: 'sale'
          },
          relevanceScore: 0.95,
          timestamp: new Date('2024-01-15'),
          location: 'Arizona, USA',
          value: 1200000000,
          tags: ['solar', 'utility-scale', 'battery-storage', 'arizona']
        },
        {
          id: '2',
          type: 'company' as const,
          title: 'Texas Wind Power Corp',
          description: 'Leading wind energy developer with 2.5GW of operating capacity',
          metadata: {
            marketCap: 5600000000,
            totalCapacity: 2500,
            employeeCount: 450,
            founded: 2018
          },
          relevanceScore: 0.87,
          location: 'Texas, USA',
          tags: ['wind', 'developer', 'texas', 'renewable']
        },
        {
          id: '3',
          type: 'property' as const,
          title: 'Industrial Site - Former Steel Mill',
          description: '450-acre brownfield site with excellent grid connectivity',
          metadata: {
            acreage: 450,
            zonning: 'industrial',
            powerCapacity: 200,
            asking_price: 45000000
          },
          relevanceScore: 0.73,
          location: 'Pennsylvania, USA',
          value: 45000000,
          tags: ['brownfield', 'industrial', 'grid-ready', 'pennsylvania']
        },
        {
          id: '4',
          type: 'insight' as const,
          title: 'Q4 2024 Market Analysis',
          description: 'Comprehensive analysis of renewable energy market trends and pricing',
          metadata: {
            reportType: 'market-analysis',
            pages: 127,
            publishDate: '2024-01-08'
          },
          relevanceScore: 0.68,
          timestamp: new Date('2024-01-08'),
          tags: ['market-analysis', 'renewable', 'trends', 'q4-2024']
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      setResults(mockResults);
      
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
                <TabsList>
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
                  <TabsTrigger value="insights">
                    Insights ({results.filter(r => r.type === 'insight').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                {['listings', 'companies', 'properties', 'insights'].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    {results
                      .filter(r => r.type === type.slice(0, -1))
                      .map((result) => (
                        <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-muted rounded-lg">
                                {getTypeIcon(result.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                                <p className="text-muted-foreground mb-3">{result.description}</p>
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