import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Trash2, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WatchlistItem {
  id: string;
  name: string;
  location: string;
  property_type: string;
  min_power_mw: number | null;
  budget_max: number | null;
  is_active: boolean;
  notify_email: boolean;
  last_scanned_at: string | null;
  created_at: string;
}

export function ScanWatchlistManager() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('industrial');
  const [newPower, setNewPower] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const { toast } = useToast();

  const fetchWatchlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('scan_watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data as WatchlistItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const addWatch = async () => {
    if (!newName || !newLocation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to create watch alerts.', variant: 'destructive' });
      return;
    }

    setAdding(true);
    const { error } = await supabase.from('scan_watchlist').insert({
      user_id: user.id,
      name: newName,
      location: newLocation,
      property_type: newType,
      min_power_mw: newPower ? parseFloat(newPower) : null,
      budget_max: newBudget ? parseFloat(newBudget) : null,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Watch Created', description: `Now monitoring "${newName}"` });
      setNewName('');
      setNewLocation('');
      setNewPower('');
      setNewBudget('');
      fetchWatchlist();
    }
    setAdding(false);
  };

  const deleteWatch = async (id: string) => {
    await supabase.from('scan_watchlist').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: 'Watch Removed' });
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('scan_watchlist').update({ is_active: active }).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: active } : i)));
  };

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Property Watch Alerts
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Save search criteria and get notified when new matching properties appear.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new watch */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
          <Input
            placeholder="Watch name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="text-xs h-8"
          />
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="data_center">Data Center</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Min MW"
            value={newPower}
            onChange={(e) => setNewPower(e.target.value)}
            type="number"
            className="text-xs h-8"
          />
          <Input
            placeholder="Max budget"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            type="number"
            className="text-xs h-8"
          />
          <Button size="sm" onClick={addWatch} disabled={adding || !newName || !newLocation} className="h-8">
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
            Add
          </Button>
        </div>

        {/* Existing watches */}
        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">Loading watches...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No watches set up yet. Create one to get notified of new properties.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">
                      {item.is_active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.location} · {item.property_type}
                    {item.min_power_mw ? ` · ≥${item.min_power_mw} MW` : ''}
                    {item.budget_max ? ` · ≤$${(item.budget_max / 1e6).toFixed(1)}M` : ''}
                  </p>
                  {item.last_scanned_at && (
                    <p className="text-[10px] text-muted-foreground">
                      Last scanned: {new Date(item.last_scanned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={(v) => toggleActive(item.id, v)}
                  />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteWatch(item.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
