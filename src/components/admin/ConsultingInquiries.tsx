import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, RefreshCw, Mail, Phone, Copy, ChevronDown, ChevronUp, MapPin, Gauge, Clock } from 'lucide-react';

type InquiryStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'archived';

interface ConsultingInquiry {
  id: string;
  full_name: string;
  company: string;
  role: string | null;
  email: string;
  phone: string | null;
  client_type: string;
  target_capacity_mw: number | null;
  target_geography: string | null;
  timeline: string | null;
  project_description: string | null;
  source: string | null;
  status: InquiryStatus | string;
  created_at: string;
  updated_at: string | null;
}

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'archived', label: 'Archived' },
];

const CLIENT_TYPE_LABEL: Record<string, string> = {
  ai_hpc: 'AI / HPC',
  bitcoin: 'Bitcoin Mining',
  inference: 'Inference / Training',
  other: 'Other',
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'new':       return 'bg-watt-bitcoin/15 text-watt-bitcoin border-watt-bitcoin/30';
    case 'contacted': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    case 'qualified': return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
    case 'won':       return 'bg-green-500/15 text-green-700 border-green-500/30';
    case 'lost':      return 'bg-red-500/15 text-red-700 border-red-500/30';
    case 'archived':  return 'bg-muted text-muted-foreground border-border';
    default:          return 'bg-muted text-muted-foreground border-border';
  }
};

export const ConsultingInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<ConsultingInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consulting_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInquiries((data || []) as ConsultingInquiry[]);
    } catch (err: any) {
      console.error('Error loading consulting inquiries:', err);
      toast({
        title: 'Failed to load inquiries',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInquiries();

    // Realtime: pick up new submissions instantly
    const channel = supabase
      .channel('consulting_inquiries_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consulting_inquiries' },
        () => fetchInquiries(),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchInquiries]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: inquiries.length };
    for (const s of STATUS_OPTIONS) c[s.value] = 0;
    for (const i of inquiries) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [inquiries]);

  const filtered = useMemo(
    () => filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter),
    [inquiries, filter],
  );

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('consulting_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      toast({ title: 'Status updated', description: `Marked as ${status}.` });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied', description: `${label} copied to clipboard.` });
    }).catch(() => {});
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Consulting Inquiries
              {counts.new > 0 && (
                <Badge className="ml-1 bg-watt-bitcoin text-white border-0">{counts.new} new</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Inbound advisory leads submitted from the WattByte Advisory page.
            </CardDescription>
          </div>
          <Button onClick={fetchInquiries} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 pt-3">
          {(['all', ...STATUS_OPTIONS.map(s => s.value)] as const).map(key => {
            const label = key === 'all' ? 'All' : STATUS_OPTIONS.find(s => s.value === key)?.label;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-watt-bitcoin text-white border-watt-bitcoin'
                    : 'bg-background text-foreground border-border hover:bg-secondary'
                }`}
              >
                {label} <span className="opacity-70">({counts[key] ?? 0})</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">
            {filter === 'all' ? 'No consulting inquiries yet.' : `No inquiries in "${filter}".`}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((i) => {
              const isOpen = expanded.has(i.id);
              return (
                <Card key={i.id} className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{i.full_name}</h3>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-foreground/80">{i.company}</span>
                          {i.role && <span className="text-xs text-muted-foreground">({i.role})</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={statusBadgeClass(i.status)}>
                            {i.status}
                          </Badge>
                          <Badge variant="outline" className="border-watt-bitcoin/30 text-watt-bitcoin">
                            {CLIENT_TYPE_LABEL[i.client_type] ?? i.client_type}
                          </Badge>
                          {i.target_capacity_mw != null && (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Gauge className="w-3 h-3" /> {i.target_capacity_mw} MW
                            </span>
                          )}
                          {i.target_geography && (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {i.target_geography}
                            </span>
                          )}
                          {i.timeline && (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {i.timeline}
                            </span>
                          )}
                        </div>
                      </div>
                      <select
                        value={i.status}
                        onChange={(e) => updateStatus(i.id, e.target.value as InquiryStatus)}
                        disabled={updating === i.id}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => copy(i.email, 'Email')}
                        className="inline-flex items-center gap-1.5 text-foreground hover:text-watt-bitcoin transition-colors"
                        title="Copy email"
                      >
                        <Mail className="w-4 h-4" /> {i.email}
                        <Copy className="w-3 h-3 opacity-60" />
                      </button>
                      {i.phone && (
                        <button
                          type="button"
                          onClick={() => copy(i.phone!, 'Phone')}
                          className="inline-flex items-center gap-1.5 text-foreground hover:text-watt-bitcoin transition-colors"
                          title="Copy phone"
                        >
                          <Phone className="w-4 h-4" /> {i.phone}
                          <Copy className="w-3 h-3 opacity-60" />
                        </button>
                      )}
                    </div>

                    {i.project_description && (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(i.id)}
                          className="text-xs font-medium text-watt-bitcoin inline-flex items-center gap-1 hover:underline"
                        >
                          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isOpen ? 'Hide project description' : 'Show project description'}
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed bg-secondary/40 rounded-md p-3 border border-border">
                            {i.project_description}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4">
                      <span>Submitted {new Date(i.created_at).toLocaleString()}</span>
                      {i.source && <span>Source: {i.source}</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultingInquiries;