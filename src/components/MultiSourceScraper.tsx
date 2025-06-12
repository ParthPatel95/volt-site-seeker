
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Search,
  Building,
  MapPin,
  Calendar,
  Play,
  Pause,
  Settings,
  Database,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  type: 'real_estate' | 'corporate' | 'news' | 'social';
  status: 'active' | 'inactive' | 'error';
  last_run?: string;
  properties_found?: number;
  keywords: string[];
}

interface ScrapingJob {
  id: string;
  source_id: string;
  source_name: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  properties_found: number;
  errors?: string[];
}

export function MultiSourceScraper() {
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'real_estate',
    keywords: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    setupDefaultSources();
  }, []);

  const setupDefaultSources = async () => {
    const defaultSources = [
      {
        name: 'LoopNet',
        url: 'https://loopnet.com',
        type: 'real_estate',
        status: 'active',
        keywords: ['data center', 'industrial', 'warehouse', 'manufacturing']
      },
      {
        name: 'CREXi',
        url: 'https://crexi.com',
        type: 'real_estate', 
        status: 'active',
        keywords: ['industrial', 'warehouse', 'power', 'heavy use']
      },
      {
        name: 'LinkedIn Corporate',
        url: 'https://linkedin.com',
        type: 'corporate',
        status: 'active',
        keywords: ['facility closure', 'restructuring', 'data center', 'expanding operations']
      },
      {
        name: 'SEC EDGAR',
        url: 'https://sec.gov/edgar',
        type: 'corporate',
        status: 'active',
        keywords: ['asset sale', 'facility', 'real estate', 'restructuring']
      },
      {
        name: 'Business Journals',
        url: 'https://bizjournals.com',
        type: 'news',
        status: 'active',
        keywords: ['facility closure', 'plant shutdown', 'data center', 'manufacturing']
      }
    ];

    // Only add if not already exists
    for (const source of defaultSources) {
      const { data: existing } = await supabase
        .from('scraping_sources')
        .select('id')
        .eq('name', source.name)
        .single();

      if (!existing) {
        await supabase.from('scraping_sources').insert(source);
      }
    }
  };

  const loadData = async () => {
    try {
      const [sourcesData, jobsData] = await Promise.all([
        supabase.from('scraping_sources').select('*').order('name'),
        supabase.from('scraping_jobs').select('*').order('started_at', { ascending: false }).limit(20)
      ]);

      if (sourcesData.data) setSources(sourcesData.data);
      if (jobsData.data) setJobs(jobsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addSource = async () => {
    if (!newSource.name || !newSource.url) return;

    try {
      const source = {
        ...newSource,
        keywords: newSource.keywords.split(',').map(k => k.trim()),
        status: 'inactive'
      };

      const { error } = await supabase.from('scraping_sources').insert(source);
      if (error) throw error;

      setNewSource({ name: '', url: '', type: 'real_estate', keywords: '' });
      loadData();
      
      toast({
        title: "Source Added",
        description: `${source.name} has been added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const runScraper = async (sourceId: string, sourceName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-source-scraper', {
        body: {
          action: 'scrape_source',
          source_id: sourceId
        }
      });

      if (error) throw error;

      toast({
        title: "Scraping Started",
        description: `Started scraping ${sourceName}`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllScrapers = async () => {
    setLoading(true);
    try {
      const activeSources = sources.filter(s => s.status === 'active');
      
      for (const source of activeSources) {
        await runScraper(source.id, source.name);
        // Add delay between scrapers to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast({
        title: "Batch Scraping Complete",
        description: `Started scraping ${activeSources.length} sources`,
      });
    } catch (error: any) {
      toast({
        title: "Batch Scraping Failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = async (sourceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('scraping_sources')
        .update({ status: newStatus })
        .eq('id', sourceId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'real_estate': return <Building className="w-4 h-4" />;
      case 'corporate': return <TrendingUp className="w-4 h-4" />;
      case 'news': return <Globe className="w-4 h-4" />;
      case 'social': return <Search className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Multi-Source Property Scraper</h1>
          <p className="text-muted-foreground">Monitor multiple platforms for potential investment opportunities</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runAllScrapers} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Run All Active
          </Button>
        </div>
      </div>

      {/* Add New Source */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Source name"
              value={newSource.name}
              onChange={(e) => setNewSource({...newSource, name: e.target.value})}
            />
            <Input
              placeholder="Base URL"
              value={newSource.url}
              onChange={(e) => setNewSource({...newSource, url: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select value={newSource.type} onValueChange={(value) => setNewSource({...newSource, type: value as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Keywords (comma separated)"
              value={newSource.keywords}
              onChange={(e) => setNewSource({...newSource, keywords: e.target.value})}
            />
          </div>
          <Button onClick={addSource} disabled={!newSource.name || !newSource.url}>
            Add Source
          </Button>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scraping Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{job.source_name}</h4>
                      <Badge className={`text-white ${getStatusColor(job.status)}`}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(job.started_at).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {job.properties_found} properties found
                      </div>
                    </div>
                  </div>
                  {job.errors && job.errors.length > 0 && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(source.type)}
                    <h3 className="text-lg font-semibold">{source.name}</h3>
                    <Badge className={`text-white ${getStatusColor(source.status)}`}>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{source.url}</span>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {source.properties_found || 0} properties found
                    </div>
                    {source.last_run && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Last run: {new Date(source.last_run).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={source.status === 'active'}
                    onCheckedChange={() => toggleSource(source.id, source.status)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => runScraper(source.id, source.name)}
                    disabled={loading || source.status !== 'active'}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {source.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sources.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No sources configured</h3>
            <p className="text-muted-foreground mb-4">
              Add scraping sources to start monitoring multiple platforms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
