
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Search, MapPin, Building } from 'lucide-react';

interface Substation {
  id: string;
  name: string;
  city: string;
  state: string;
  voltage_level: string;
  capacity_mva: number;
  utility_owner: string;
  interconnection_type: string;
  load_factor: number;
  status: string;
}

export function SubstationsOverview() {
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [filteredSubstations, setFilteredSubstations] = useState<Substation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  const loadSubstations = async () => {
    try {
      console.log('Loading substations data...');
      
      const { data, error } = await supabase
        .from('substations')
        .select('*')
        .order('capacity_mva', { ascending: false });

      if (error) {
        console.error('Error loading substations:', error);
        toast({
          title: "Error Loading Data",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const substationsData = data || [];
      setSubstations(substationsData);
      setFilteredSubstations(substationsData);
      
      console.log('Substations loaded:', substationsData.length, 'substations');
    } catch (error) {
      console.error('Error loading substations:', error);
      toast({
        title: "Error",
        description: "Failed to load substations data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubstations();
  }, []);

  useEffect(() => {
    let filtered = substations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.utility_owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply state filter
    if (stateFilter !== 'all') {
      filtered = filtered.filter(sub => sub.state === stateFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(sub => sub.interconnection_type === typeFilter);
    }

    setFilteredSubstations(filtered);
  }, [substations, searchTerm, stateFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default' as const;
      case 'inactive':
        return 'secondary' as const;
      case 'maintenance':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getVoltageColor = (voltage: string) => {
    if (voltage.includes('735kV') || voltage.includes('500kV')) {
      return 'text-red-600 font-bold';
    } else if (voltage.includes('345kV')) {
      return 'text-orange-600 font-semibold';
    } else if (voltage.includes('240kV') || voltage.includes('230kV')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const uniqueStates = [...new Set(substations.map(sub => sub.state))].sort();
  const uniqueTypes = [...new Set(substations.map(sub => sub.interconnection_type))].sort();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Zap className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading substations data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Substations</p>
                <p className="text-2xl font-bold">{filteredSubstations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Capacity</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredSubstations.reduce((sum, sub) => sum + sub.capacity_mva, 0)).toLocaleString()} MVA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">States/Provinces</p>
                <p className="text-2xl font-bold">{uniqueStates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Load Factor</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredSubstations.reduce((sum, sub) => sum + sub.load_factor, 0) / filteredSubstations.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Filter Substations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, city, or utility..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State/Province</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States/Provinces</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Substations List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Substations Directory ({filteredSubstations.length} of {substations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSubstations.map((substation) => (
              <div key={substation.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{substation.name}</h3>
                      <Badge variant={getStatusColor(substation.status)}>
                        {substation.status}
                      </Badge>
                      <Badge variant="outline" className={getVoltageColor(substation.voltage_level)}>
                        {substation.voltage_level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{substation.city}, {substation.state}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{substation.utility_owner}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span>{substation.interconnection_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold text-yellow-600">
                      {substation.capacity_mva.toLocaleString()} MVA
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {substation.load_factor}% load factor
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
