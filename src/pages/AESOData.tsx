
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAESOData } from '@/hooks/useAESOData';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';

export default function AESOData() {
  const { pricing, loadData, generationMix, loading: loadingCore, connectionStatus: coreStatus, refetch: refetchCore } = useAESOData();
  const {
    operatingReserve,
    interchange,
    energyStorage,
    loading: loadingMarket,
    connectionStatus: marketStatus,
    refetch: refetchMarket
  } = useAESOMarketData();

  const loading = loadingCore || loadingMarket;

  // SEO and meta tags
  useEffect(() => {
    const title = 'AESO Data Explorer | Real-time Alberta power data';
    const desc = 'Live AESO data: pricing, load, generation mix, interchange, reserves, and storage for Alberta power market.';
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/app/aeso-data`);
  }, []);

  const onRefresh = () => {
    refetchCore();
    refetchMarket();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AESO Data Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Real-time AESO data from official APIs: pricing pool, load, generation mix, interchange, operating reserves, and energy storage.
        </p>
        <div className="mt-4">
          <Button onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh data'}
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing (Pool Price)</CardTitle>
          </CardHeader>
          <CardContent>
            {pricing ? (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-medium">{pricing.current_price} $/MWh</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Average (today)</span><span className="font-medium">{pricing.average_price} $/MWh</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Peak</span><span className="font-medium">{pricing.peak_price} $/MWh</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Off-peak</span><span className="font-medium">{pricing.off_peak_price} $/MWh</span></div>
                <p className="text-xs text-muted-foreground mt-2">Source: {pricing.source || 'aeso_api'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No pricing data.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Load</CardTitle>
          </CardHeader>
          <CardContent>
            {loadData ? (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Current demand</span><span className="font-medium">{loadData.current_demand_mw} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Peak forecast</span><span className="font-medium">{loadData.peak_forecast_mw} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reserve margin</span><span className="font-medium">{loadData.reserve_margin}%</span></div>
                <p className="text-xs text-muted-foreground mt-2">Source: {loadData.source || 'aeso_api'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No load data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Generation Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {generationMix ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className="text-muted-foreground text-sm">Total</div><div className="font-semibold">{generationMix.total_generation_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Natural Gas</div><div className="font-semibold">{generationMix.natural_gas_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Wind</div><div className="font-semibold">{generationMix.wind_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Solar</div><div className="font-semibold">{generationMix.solar_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Hydro</div><div className="font-semibold">{generationMix.hydro_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Coal</div><div className="font-semibold">{generationMix.coal_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Other</div><div className="font-semibold">{generationMix.other_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Renewables Share</div><div className="font-semibold">{Math.round(generationMix.renewable_percentage)}%</div></div>
                <p className="text-xs text-muted-foreground md:col-span-4">Source: {generationMix.source || 'aeso_api'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No generation mix data.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Reserves</CardTitle>
          </CardHeader>
          <CardContent>
            {operatingReserve ? (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{operatingReserve.total_reserve_mw} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Spinning</span><span className="font-medium">{operatingReserve.spinning_reserve_mw} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Supplemental</span><span className="font-medium">{operatingReserve.supplemental_reserve_mw} MW</span></div>
                <p className="text-xs text-muted-foreground mt-2">Real-time from AESO CSD v2</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No operating reserve data.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interchange</CardTitle>
          </CardHeader>
          <CardContent>
            {interchange ? (
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">AB ↔ BC</span><span className="font-medium">{interchange.alberta_british_columbia} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">AB ↔ SK</span><span className="font-medium">{interchange.alberta_saskatchewan} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">AB ↔ Montana</span><span className="font-medium">{interchange.alberta_montana} MW</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total net</span><span className="font-medium">{interchange.total_net_interchange} MW</span></div>
                <p className="text-xs text-muted-foreground mt-2">Real-time from AESO CSD v2</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No interchange data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Energy Storage</CardTitle>
          </CardHeader>
          <CardContent>
            {energyStorage ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><div className="text-muted-foreground text-sm">Charging</div><div className="font-semibold">{energyStorage.charging_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Discharging</div><div className="font-semibold">{energyStorage.discharging_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">Net</div><div className="font-semibold">{energyStorage.net_storage_mw} MW</div></div>
                <div><div className="text-muted-foreground text-sm">State of Charge</div><div className="font-semibold">{energyStorage.state_of_charge_percent}%</div></div>
                <p className="text-xs text-muted-foreground md:col-span-4">Real-time from AESO CSD v2</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No energy storage data.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <aside className="mt-8 text-sm text-muted-foreground">
        <p>Status: Core {coreStatus}, Market {marketStatus}</p>
      </aside>
    </main>
  );
}
