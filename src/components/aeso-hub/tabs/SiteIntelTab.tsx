import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Network, Map as MapIcon, FileSearch, Info } from 'lucide-react';
import { AlbertaMap } from '../site-intel/AlbertaMap';
import { SiteLookupForm } from '../site-intel/SiteLookupForm';
import { SiteWorkspace } from '../site-intel/SiteWorkspace';
import { useGenerateSiteReport, type SiteReport as SiteReportT } from '@/hooks/useAlbertaSiteReport';
import { toast } from 'sonner';

export function SiteIntelTab() {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [report, setReport] = useState<SiteReportT | null>(null);
  const generate = useGenerateSiteReport();

  const handleResolve = async (loc: { lat: number; lng: number; label?: string }) => {
    setPin({ lat: loc.lat, lng: loc.lng });
    try {
      const r = await generate.mutateAsync(loc);
      setReport(r);
      toast.success('Site report generated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Network className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Alberta Site Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            Fiber, transmission, gas, water, and logistics for any Alberta location. Curated from verified public sources
            (AESO transmission topology, CRTC fiber, CER pipelines, carrier coverage pages, municipal industrial sites).
          </p>
        </div>
      </div>

      <Tabs defaultValue="explorer" className="w-full">
        <TabsList>
          <TabsTrigger value="explorer"><MapIcon className="w-4 h-4 mr-2" />Map Explorer</TabsTrigger>
          <TabsTrigger value="lookup"><FileSearch className="w-4 h-4 mr-2" />Site Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-4 mt-4">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="w-3 h-3" /> Toggle layers using the control in the top-right of the map. Click anywhere to drop a pin, then jump to <strong>Site Lookup</strong> to generate a full report.
            </p>
          </Card>
          <AlbertaMap selected={pin} onPick={(l) => { setPin(l); toast.message('Pin set', { description: `${l.lat.toFixed(4)}, ${l.lng.toFixed(4)} — open Site Lookup tab to generate report.` }); }} />
          <LegendStrip />
        </TabsContent>

        <TabsContent value="lookup" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
            <SiteLookupForm
              initialLat={pin?.lat ?? null}
              initialLng={pin?.lng ?? null}
              onResolve={handleResolve}
              onClear={() => { setPin(null); setReport(null); }}
              loading={generate.isPending}
            />
            <div className="min-h-[400px]">
              {report ? (
                <SiteWorkspace report={report} />
              ) : (
                <Card className="h-full flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  Enter an address or coordinates (or pick a point on the map) to generate a comprehensive site intelligence report.
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LegendStrip() {
  const items = [
    { color: '#10B981', label: 'Transmission line' },
    { color: '#3B82F6', label: 'Fiber long-haul' },
    { color: '#F7931A', label: 'Carrier POP' },
    { color: '#A855F7', label: 'Gas pipeline' },
    { color: '#06B6D4', label: 'Water source' },
    { color: '#EF4444', label: 'Industrial park' },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: i.color }} />
          {i.label}
        </div>
      ))}
    </div>
  );
}