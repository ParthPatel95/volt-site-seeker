import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  onResolve: (loc: { lat: number; lng: number; label?: string }) => void;
  onClear?: () => void;
  loading?: boolean;
}

export function SiteLookupForm({ initialLat, initialLng, onResolve, onClear, loading }: Props) {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(initialLat?.toString() ?? '');
  const [lng, setLng] = useState(initialLng?.toString() ?? '');
  const [geocoding, setGeocoding] = useState(false);

  // Sync from external pin ONLY when the external pin actually changes,
  // so the user can still edit/clear the coord fields freely.
  const lastPinRef = useRef<{ lat: number | null | undefined; lng: number | null | undefined }>({
    lat: initialLat, lng: initialLng,
  });
  useEffect(() => {
    if (initialLat !== lastPinRef.current.lat && initialLat !== null && initialLat !== undefined) {
      setLat(initialLat.toString());
    }
    if (initialLng !== lastPinRef.current.lng && initialLng !== null && initialLng !== undefined) {
      setLng(initialLng.toString());
    }
    lastPinRef.current = { lat: initialLat, lng: initialLng };
  }, [initialLat, initialLng]);

  const geocode = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ lat: number; lng: number; label: string }>(
        'geocode-address',
        { body: { query: address } },
      );
      if (error) {
        console.error('Geocode error:', error);
        toast.error(`Geocoding failed: ${error.message ?? 'unknown error'}. Try adding city/province, or drop a pin on the map.`);
        return;
      }
      if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
        toast.error('Address not found. Try adding city/province, or drop a pin on the map.');
        return;
      }
      setLat(data.lat.toString());
      setLng(data.lng.toString());
      onResolve({ lat: data.lat, lng: data.lng, label: data.label ?? address });
    } catch (e: any) {
      console.error('Geocode exception:', e);
      toast.error(`Geocoding failed: ${e?.message ?? 'network error'}. Try coordinates instead.`);
    } finally {
      setGeocoding(false);
    }
  };

  const submitCoords = () => {
    const la = parseFloat(lat); const lo = parseFloat(lng);
    if (Number.isNaN(la) || Number.isNaN(lo)) { toast.error('Invalid coordinates'); return; }
    onResolve({ lat: la, lng: lo, label: address || undefined });
  };

  const clearAll = () => {
    setAddress(''); setLat(''); setLng('');
    lastPinRef.current = { lat: null, lng: null };
    onClear?.();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addr">Address (Canada or USA)</Label>
        <div className="flex gap-2">
          <Input id="addr" placeholder="e.g. 7007 54 St SE, Calgary or Midland, TX" value={address} onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode()} />
          <Button onClick={geocode} disabled={geocoding || !address.trim()} variant="secondary">
            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Geocoded server-side via OpenStreetMap. You can also click the map to drop a pin.</p>
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
      <div className="flex gap-2">
        <Button onClick={submitCoords} disabled={loading || !lat || !lng} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
          Generate Site Report
        </Button>
        <Button onClick={clearAll} variant="outline" disabled={loading} title="Clear address and coordinates">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}