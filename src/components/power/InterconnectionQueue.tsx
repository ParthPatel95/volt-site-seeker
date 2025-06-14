
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  MapPin, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  DollarSign,
  Calendar,
  Target
} from 'lucide-react';

interface QueueProject {
  id: string;
  project_name: string;
  utility_iso: string;
  state: string;
  county: string;
  capacity_mw: number;
  technology_type: string;
  queue_position: number;
  interconnection_request_date: string;
  proposed_online_date: string;
  estimated_cost: number;
  status: string;
  delay_probability: number;
  estimated_delay_months: number;
  withdrawal_risk: string;
  created_at: string;
}

export function InterconnectionQueue() {
  const [projects, setProjects] = useState<QueueProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<QueueProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isoFilter, setIsoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const { toast } = useToast();

  const loadQueueData = async () => {
    try {
      console.log('Loading interconnection queue data...');
      
      const { data, error } = await supabase
        .from('interconnection_queue')
        .select('*')
        .order('queue_position', { ascending: true });

      if (error) {
        console.error('Error loading queue data:', error);
        toast({
          title: "Error Loading Data",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const projectsData = data || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      
      console.log('Queue data loaded:', projectsData.length, 'projects');
    } catch (error) {
      console.error('Error loading queue data:', error);
      toast({
        title: "Error",
        description: "Failed to load interconnection queue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueueData();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.county.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (isoFilter !== 'all') {
      filtered = filtered.filter(project => project.utility_iso === isoFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (technologyFilter !== 'all') {
      filtered = filtered.filter(project => project.technology_type === technologyFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, isoFilter, statusFilter, technologyFilter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'in_progress': return 'secondary';
      case 'delayed': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const uniqueISOs = [...new Set(projects.map(p => p.utility_iso))].sort();
  const uniqueStatuses = [...new Set(projects.map(p => p.status))].sort();
  const uniqueTechnologies = [...new Set(projects.map(p => p.technology_type))].sort();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interconnection queue data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(projects.reduce((sum, p) => sum + p.capacity_mw, 0)).toLocaleString()} MW
            </div>
            <p className="text-xs text-muted-foreground">Planned capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delay Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(projects.reduce((sum, p) => sum + p.delay_probability, 0) / projects.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Delay probability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(projects.reduce((sum, p) => sum + p.estimated_cost, 0) / 1000000)}M
            </div>
            <p className="text-xs text-muted-foreground">Total estimated cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Filters</CardTitle>
          <CardDescription>Filter interconnection queue projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={isoFilter} onValueChange={setIsoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All ISOs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ISOs</SelectItem>
                {uniqueISOs.map(iso => (
                  <SelectItem key={iso} value={iso}>{iso}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Technologies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technologies</SelectItem>
                {uniqueTechnologies.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadQueueData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>Active interconnection requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{project.project_name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{project.county}, {project.state}</span>
                      <Badge variant="outline">{project.utility_iso}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Queue #{project.queue_position}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Capacity</div>
                    <div className="font-medium">{project.capacity_mw} MW</div>
                    <div className="text-xs text-muted-foreground">{project.technology_type}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Estimated Cost</div>
                    <div className="font-medium">${(project.estimated_cost / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-muted-foreground">Total investment</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Timeline</div>
                    <div className="font-medium">
                      {new Date(project.proposed_online_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.estimated_delay_months > 0 && (
                        <span className="text-orange-600">
                          +{project.estimated_delay_months} mo delay
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Risk Assessment</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Delay Risk</span>
                        <span className="font-medium">{project.delay_probability}%</span>
                      </div>
                      <Progress value={project.delay_probability} className="h-2" />
                      <div className={`text-xs font-medium ${getRiskColor(project.withdrawal_risk)}`}>
                        {project.withdrawal_risk} withdrawal risk
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
