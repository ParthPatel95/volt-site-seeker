import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  onResolve: (loc: { lat: number; lng: number; label?: string }) => void;
  loading?: boolean;
}

export function SiteLookupForm({ initialLat, initialLng, onResolve, loading }: Props) {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(initialLat?.toString() ?? '');
  const [lng, setLng] = useState(initialLng?.toString() ?? '');
  const [geocoding, setGeocoding] = useState(false);

  // Sync from external pin
  if (initialLat !== undefined && initialLat !== null && initialLat.toString() !== lat) setLat(initialLat.toString());
  if (initialLng !== undefined && initialLng !== null && initialLng.toString() !== lng) setLng(initialLng.toString());

  const geocode = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ca&q=${encodeURIComponent(address + ', Alberta')}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        toast.error('Address not found in Alberta');
        return;
      }
      const hit = json[0];
      const la = parseFloat(hit.lat); const lo = parseFloat(hit.lon);
      setLat(la.toString()); setLng(lo.toString());
      onResolve({ lat: la, lng: lo, label: hit.display_name });
    } catch (e) {
      toast.error('Geocoding failed');
    } finally {
      setGeocoding(false);
    }
  };

  const submitCoords = () => {
    const la = parseFloat(lat); const lo = parseFloat(lng);
    if (Number.isNaN(la) || Number.isNaN(lo)) { toast.error('Invalid coordinates'); return; }
    onResolve({ lat: la, lng: lo, label: address || undefined });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addr">Address (Alberta)</Label>
        <div className="flex gap-2">
          <Input id="addr" placeholder="e.g. 7007 54 St SE, Calgary" value={address} onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode()} />
          <Button onClick={geocode} disabled={geocoding || !address.trim()} variant="secondary">
            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Geocoded via OpenStreetMap Nominatim. You can also click the map to drop a pin.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="lat" className="text-xs">Latitude</Label>
          <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="53.5461" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lng" className="text-xs">Longitude</Label>
          <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-113.4938" />
        </div>
      </div>
      <Button onClick={submitCoords} disabled={loading || !lat || !lng} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
        Generate Site Report
      </Button>
    </Card>
  );
}