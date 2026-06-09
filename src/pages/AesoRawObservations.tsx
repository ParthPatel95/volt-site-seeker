import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, Search } from "lucide-react";

interface RawObservation {
  id: number;
  observed_for: string;
  observed_at: string;
  pool_price: number | null;
  system_marginal_price: number | null;
  forecast_pool_price: number | null;
  ail_demand_mw: number | null;
  source: string;
  source_endpoint: string | null;
  revision_id: string | null;
  api_response_status: number | null;
  request_id: string;
  raw_payload: unknown;
  metadata: unknown;
  created_at: string;
}

interface Cursor {
  observed_for: string;
  id: number;
}

const PAGE_SIZE = 100;

function toLocal(dt: string) {
  try {
    return new Date(dt).toISOString().replace("T", " ").slice(0, 16) + "Z";
  } catch {
    return dt;
  }
}

function parseDateInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AesoRawObservations() {
  const [rows, setRows] = useState<RawObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Cursor stack for back-navigation
  const [cursorHistory, setCursorHistory] = useState<Cursor[]>([]);
  const [currentCursor, setCurrentCursor] = useState<Cursor | null>(null);

  // Filters
  const [hourFrom, setHourFrom] = useState("");
  const [hourTo, setHourTo] = useState("");
  const [source, setSource] = useState("");
  const [revision, setRevision] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const [selected, setSelected] = useState<RawObservation | null>(null);

  const filters = {
    hourFrom: parseDateInput(hourFrom),
    hourTo: parseDateInput(hourTo),
    source: source || null,
    revision: revision || null,
    endpoint: endpoint || null,
  };

  const load = useCallback(
    async (cursor: Cursor | null, direction: "initial" | "next" | "prev") => {
      setLoading(true);
      setError(null);
      try {
        // Fetch page
        const { data: pageData, error: pageErr } = await supabase.rpc(
          "get_aeso_raw_observations_cursor",
          {
            p_page_size: PAGE_SIZE,
            p_cursor_observed_for: cursor?.observed_for ?? null,
            p_cursor_id: cursor?.id ?? null,
            p_hour_from: filters.hourFrom,
            p_hour_to: filters.hourTo,
            p_source: filters.source,
            p_revision_id: filters.revision,
            p_endpoint: filters.endpoint,
          }
        );

        if (pageErr) throw pageErr;
        const pageRows = (pageData ?? []) as unknown as RawObservation[];

        // Fetch total count (only on initial load to avoid extra calls when paginating)
        let countVal: number | null = total;
        if (direction === "initial" || total === null) {
          const { data: countData, error: countErr } = await supabase.rpc(
            "count_aeso_raw_observations",
            {
              p_hour_from: filters.hourFrom,
              p_hour_to: filters.hourTo,
              p_source: filters.source,
              p_revision_id: filters.revision,
              p_endpoint: filters.endpoint,
            }
          );
          if (!countErr) {
            countVal = (countData as unknown as number) ?? null;
          }
        }

        setRows(pageRows);
        setTotal(countVal);
        setHasMore(pageRows.length === PAGE_SIZE);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load observations");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.hourFrom, filters.hourTo, filters.source, filters.revision, filters.endpoint]
  );

  const onSearch = () => {
    setCursorHistory([]);
    setCurrentCursor(null);
    load(null, "initial");
  };

  const goNext = () => {
    if (rows.length === 0) return;
    const last = rows[rows.length - 1];
    const nextCursor = { observed_for: last.observed_for, id: last.id };
    setCursorHistory((h) => [...h, currentCursor!].filter(Boolean) as Cursor[]);
    setCurrentCursor(nextCursor);
    load(nextCursor, "next");
  };

  const goPrev = () => {
    setCursorHistory((h) => {
      const prev = h[h.length - 1] ?? null;
      setCurrentCursor(prev);
      load(prev, "prev");
      return h.slice(0, -1);
    });
  };

  useEffect(() => {
    load(null, "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGoBack = cursorHistory.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AESO Raw Observations</h1>
        <p className="text-sm text-muted-foreground">
          Append-only history of every raw AESO price snapshot ingested. Browse
          by hour, source, endpoint, or revision ID.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Hour from (UTC)</Label>
            <Input
              type="datetime-local"
              value={hourFrom}
              onChange={(e) => setHourFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hour to (UTC)</Label>
            <Input
              type="datetime-local"
              value={hourTo}
              onChange={(e) => setHourTo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Source</Label>
            <Input
              placeholder="aeso-data-collector"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Endpoint contains</Label>
            <Input
              placeholder="poolPrice"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Revision ID</Label>
            <Input
              placeholder="rev-..."
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-5 flex gap-2">
            <Button onClick={onSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Apply filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setHourFrom("");
                setHourTo("");
                setSource("");
                setRevision("");
                setEndpoint("");
                setCursorHistory([]);
                setCurrentCursor(null);
                setTimeout(() => load(null, "initial"), 0);
              }}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={() => load(currentCursor, "initial")}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Observations{" "}
            {total != null && (
              <span className="text-muted-foreground font-normal">
                ({total.toLocaleString()})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Button
              size="sm"
              variant="outline"
              disabled={!canGoBack || loading}
              onClick={goPrev}
            >
              Prev
            </Button>
            <span className="text-muted-foreground">
              Page {cursorHistory.length + 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={loading || !hasMore}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour (UTC)</TableHead>
                  <TableHead>Pulled at</TableHead>
                  <TableHead className="text-right">Pool $</TableHead>
                  <TableHead className="text-right">SMP</TableHead>
                  <TableHead className="text-right">AIL MW</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setSelected(r)}
                  >
                    <TableCell className="font-mono text-xs">
                      {toLocal(r.observed_for)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {toLocal(r.observed_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.pool_price ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.system_marginal_price ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.ail_demand_mw ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.source}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.source_endpoint ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.revision_id ?? "—"}
                    </TableCell>
                    <TableCell>{r.api_response_status ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.request_id.slice(0, 8)}
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-muted-foreground py-8"
                    >
                      No observations match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Observation #{selected?.id} —{" "}
              {selected && toLocal(selected.observed_for)}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground text-xs">Source</div>
                  <div>{selected.source}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Endpoint</div>
                  <div>{selected.source_endpoint ?? "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Revision ID
                  </div>
                  <div className="font-mono">{selected.revision_id ?? "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Request ID
                  </div>
                  <div className="font-mono">{selected.request_id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    API status
                  </div>
                  <div>{selected.api_response_status ?? "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">
                    Created at
                  </div>
                  <div>{toLocal(selected.created_at)}</div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Metadata
                </div>
                <pre className="bg-secondary p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(selected.metadata, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Raw payload
                </div>
                <pre className="bg-secondary p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(selected.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}