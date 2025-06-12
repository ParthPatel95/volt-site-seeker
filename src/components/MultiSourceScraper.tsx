
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Search,
  Building,
  MapPin,
  Calendar,
  Play,
  Settings,
  Database,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Trash2
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
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading scraping data...');

      // Load sources from database
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('scraping_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourcesError) {
        console.error('Error loading sources:', sourcesError);
      } else {
        setSources(sourcesData || []);
      }

      // Load jobs from database
      const { data: jobsData, error: jobsError } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (jobsError) {
        console.error('Error loading jobs:', jobsError);
      } else {
        setJobs(jobsData || []);
      }

      console.log('Loaded sources:', sourcesData?.length, 'jobs:', jobsData?.length);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast({
        title: "Error",
        description: "Please enter both name and URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Adding new source:', newSource);

      const sourceData = {
        name: newSource.name,
        url: newSource.url,
        type: newSource.type,
        keywords: newSource.keywords.split(',').map(k => k.trim()).filter(k => k),
        status: 'inactive'
      };

      const { data, error } = await supabase
        .from('scraping_sources')
        .insert(sourceData)
        .select()
        .single();

      if (error) {
        console.error('Error adding source:', error);
        throw error;
      }

      console.log('Added source:', data);
      
      setNewSource({ name: '', url: '', type: 'real_estate', keywords: '' });
      
      toast({
        title: "Source Added",
        description: `${sourceData.name} has been added successfully`,
      });

      loadData();
    } catch (error: any) {
      console.error('Failed to add source:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to add source',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async (sourceId: string, sourceName: string) => {
    setLoading(true);
    try {
      console.log('Running scraper for:', sourceName, sourceId);
      
      const { data, error } = await supabase.functions.invoke('multi-source-scraper', {
        body: {
          action: 'scrape_source',
          source_id: sourceId
        }
      });

      if (error) {
        console.error('Scraping error:', error);
        throw error;
      }

      console.log('Scraping result:', data);

      toast({
        title: "Scraping Started",
        description: `Started scraping ${sourceName}`,
      });

      loadData();
    } catch (error: any) {
      console.error('Scraping failed:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || 'Failed to start scraping',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllScrapers = async () => {
    setLoading(true);
    try {
      console.log('Running all scrapers...');
      
      const activeSources = sources.filter(s => s.status === 'active');
      
      if (activeSources.length === 0) {
        toast({
          title: "No Active Sources",
          description: "Please activate at least one source first",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('multi-source-scraper', {
        body: { action: 'scrape_all' }
      });

      if (error) {
        console.error('Batch scraping error:', error);
        throw error;
      }

      console.log('Batch scraping result:', data);

      toast({
        title: "Batch Scraping Started",
        description: `Started scraping ${activeSources.length} sources`,
      });

      loadData();
    } catch (error: any) {
      console.error('Batch scraping failed:', error);
      toast({
        title: "Batch Scraping Failed", 
        description: error.message || 'Failed to start batch scraping',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = async (sourceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      console.log('Toggling source status:', sourceId, newStatus);

      const { error } = await supabase
        .from('scraping_sources')
        .update({ status: newStatus })
        .eq('id', sourceId);

      if (error) {
        console.error('Error updating source status:', error);
        throw error;
      }

      setSources(prev => prev.map(source => 
        source.id === sourceId ? { ...source, status: newStatus as any } : source
      ));

      toast({
        title: "Source Updated",
        description: `Source ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch (error: any) {
      console.error('Failed to toggle source:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update source',
        variant: "destructive"
      });
    }
  };

  const deleteSource = async (sourceId: string, sourceName: string) => {
    try {
      console.log('Deleting source:', sourceId, sourceName);

      const { error } = await supabase
        .from('scraping_sources')
        .delete()
        .eq('id', sourceId);

      if (error) {
        console.error('Error deleting source:', error);
        throw error;
      }

      setSources(prev => prev.filter(source => source.id !== sourceId));

      toast({
        title: "Source Deleted",
        description: `${sourceName} has been deleted`,
      });
    } catch (error: any) {
      console.error('Failed to delete source:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete source',
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
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
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
          <Button onClick={addSource} disabled={loading || !newSource.name || !newSource.url}>
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
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
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteSource(source.id, source.name)}
                    disabled={loading}
                  >
                    <Trash2 className="w-3 h-3" />
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
