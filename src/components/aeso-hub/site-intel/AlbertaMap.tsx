import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, LayersControl, LayerGroup, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAlbertaLayers } from '@/hooks/useAlbertaSiteReport';

// Fix default Leaflet icon paths in bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = {
  pop: '#F7931A',
  fiber: '#3B82F6',
  transmission: '#10B981',
  gas: '#A855F7',
  water: '#06B6D4',
  park: '#EF4444',
  selected: '#0A1628',
};

interface Props {
  selected?: { lat: number; lng: number } | null;
  onPick?: (latlng: { lat: number; lng: number }) => void;
}

function ClickHandler({ onPick }: { onPick?: (l: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function AlbertaMap({ selected, onPick }: Props) {
  const { data, isLoading } = useAlbertaLayers();
  const center: [number, number] = useMemo(() => [53.5, -114.0], []);

  return (
    <div className="relative w-full h-[560px] rounded-lg overflow-hidden border border-border">
      {isLoading && (
        <div className="absolute inset-0 z-[500] bg-background/60 backdrop-blur-sm flex items-center justify-center text-sm text-muted-foreground">
          Loading Alberta infrastructure layers…
        </div>
      )}
      <MapContainer center={center} zoom={6} className="w-full h-full" scrollWheelZoom>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Streets (OSM)">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Transmission lines (138/240/500 kV)">
            <LayerGroup>
              {(data?.transmission ?? []).map((t: any) => (
                <Polyline key={t.id} positions={[[t.start_lat, t.start_lng], [t.end_lat, t.end_lng]]}
                  pathOptions={{ color: COLORS.transmission, weight: t.voltage_kv >= 500 ? 4 : 3, opacity: 0.85 }}>
                  <Tooltip>{t.name} · {t.voltage_kv} kV · {t.owner}</Tooltip>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Fiber long-haul routes">
            <LayerGroup>
              {(data?.fiber ?? []).map((f: any) => (
                <Polyline key={f.id} positions={[[f.start_lat, f.start_lng], [f.end_lat, f.end_lng]]}
                  pathOptions={{ color: COLORS.fiber, weight: 2.5, opacity: 0.7, dashArray: '6 4' }}>
                  <Tooltip>{f.carrier} · {f.route_name}</Tooltip>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Carrier POPs">
            <LayerGroup>
              {(data?.pops ?? []).map((p: any) => (
                <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={6}
                  pathOptions={{ color: COLORS.pop, fillColor: COLORS.pop, fillOpacity: 0.9 }}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold">{p.carrier}</div>
                      <div>{p.facility_name}</div>
                      <div className="text-muted-foreground">{p.address}, {p.city}</div>
                      <div>Services: {(p.services ?? []).join(', ')}</div>
                      <div>Latency → SEA: {p.latency_to_sea_ms}ms · ORD: {p.latency_to_ord_ms}ms</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="NGTL gas pipelines">
            <LayerGroup>
              {(data?.gas ?? []).map((g: any) => (
                <Polyline key={g.id} positions={[[g.start_lat, g.start_lng], [g.end_lat, g.end_lng]]}
                  pathOptions={{ color: COLORS.gas, weight: 2.5, opacity: 0.75 }}>
                  <Tooltip>{g.name} · {g.diameter_mm}mm · {g.pressure_kpa}kPa</Tooltip>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Water sources">
            <LayerGroup>
              {(data?.water ?? []).map((w: any) => (
                <CircleMarker key={w.id} center={[w.lat, w.lng]} radius={5}
                  pathOptions={{ color: COLORS.water, fillColor: COLORS.water, fillOpacity: 0.7 }}>
                  <Tooltip>{w.name} ({w.type})</Tooltip>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Industrial parks">
            <LayerGroup>
              {(data?.parks ?? []).map((pk: any) => (
                <CircleMarker key={pk.id} center={[pk.lat, pk.lng]} radius={7}
                  pathOptions={{ color: COLORS.park, fillColor: COLORS.park, fillOpacity: 0.7 }}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold">{pk.name}</div>
                      <div>{pk.municipality}</div>
                      <div>Available power: {pk.available_power_mw} MW</div>
                      <div>Zoning: {pk.zoning}</div>
                      {pk.notes && <div className="text-muted-foreground">{pk.notes}</div>}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {selected && (
          <Marker position={[selected.lat, selected.lng]}>
            <Popup>Selected site<br />{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</Popup>
          </Marker>
        )}
        <ClickHandler onPick={onPick} />
      </MapContainer>
    </div>
  );
}