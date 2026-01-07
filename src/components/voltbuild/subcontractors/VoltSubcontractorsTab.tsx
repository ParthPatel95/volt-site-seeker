import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Building2, Phone, Mail, AlertTriangle, Trash2, Star } from 'lucide-react';
import { useSubcontractors, Subcontractor, SubcontractorTrade, SubcontractorStatus, TRADE_CONFIG, SUBCONTRACTOR_TRADES } from './hooks/useSubcontractors';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format, differenceInDays } from 'date-fns';

interface VoltSubcontractorsTabProps {
  project: VoltBuildProject;
}

export function VoltSubcontractorsTab({ project }: VoltSubcontractorsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tradeFilter, setTradeFilter] = useState<SubcontractorTrade | 'all'>('all');

  const [form, setForm] = useState({
    company_name: '',
    trade: 'electrical' as SubcontractorTrade,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contract_value: '',
    contract_date: '',
    contract_end_date: '',
    insurance_expiry: '',
    wcb_expiry: '',
    notes: '',
  });

  const { 
    subcontractors, 
    createSubcontractor, 
    updateSubcontractor,
    deleteSubcontractor,
    getStats,
    isCreating,
    isLoading 
  } = useSubcontractors(project.id);

  const stats = getStats();
  const filteredSubs = tradeFilter === 'all' 
    ? subcontractors 
    : subcontractors.filter(s => s.trade === tradeFilter);

  const handleCreate = () => {
    createSubcontractor({
      project_id: project.id,
      company_name: form.company_name,
      trade: form.trade,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      contract_value: form.contract_value ? parseFloat(form.contract_value) : null,
      contract_date: form.contract_date || null,
      contract_end_date: form.contract_end_date || null,
      insurance_expiry: form.insurance_expiry || null,
      wcb_expiry: form.wcb_expiry || null,
      safety_rating: null,
      performance_rating: null,
      status: 'active',
      notes: form.notes || null,
    });
    setDialogOpen(false);
    setForm({
      company_name: '',
      trade: 'electrical',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      contract_value: '',
      contract_date: '',
      contract_end_date: '',
      insurance_expiry: '',
      wcb_expiry: '',
      notes: '',
    });
  };

  const getInsuranceStatus = (expiry: string | null) => {
    if (!expiry) return null;
    const days = differenceInDays(new Date(expiry), new Date());
    if (days < 0) return { text: 'Expired', color: 'text-destructive' };
    if (days <= 30) return { text: `${days} days`, color: 'text-amber-500' };
    return { text: 'Valid', color: 'text-green-500' };
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className={`w-3 h-3 ${rating >= 4 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Subcontractors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-mono">${(stats.totalValue / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Total Contract Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-500">{stats.expiringInsurance}</div>
            <p className="text-xs text-muted-foreground">Expiring Insurance</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Insurance Alert */}
      {stats.expiringInsurance > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insurance Expiring Soon</AlertTitle>
          <AlertDescription>
            {stats.expiringInsurance} subcontractor(s) have insurance expiring within 30 days.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Select value={tradeFilter} onValueChange={(v) => setTradeFilter(v as typeof tradeFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {SUBCONTRACTOR_TRADES.map(trade => (
              <SelectItem key={trade} value={trade}>{TRADE_CONFIG[trade].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subcontractor
        </Button>
      </div>

      {/* Subcontractors Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Contract Value</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map(sub => {
              const insuranceStatus = getInsuranceStatus(sub.insurance_expiry);
              return (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{sub.company_name}</p>
                        {sub.contact_name && (
                          <p className="text-xs text-muted-foreground">{sub.contact_name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={TRADE_CONFIG[sub.trade].color}>
                      {TRADE_CONFIG[sub.trade].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sub.contact_email && (
                        <a href={`mailto:${sub.contact_email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                          <Mail className="w-3 h-3" />
                          {sub.contact_email}
                        </a>
                      )}
                      {sub.contact_phone && (
                        <a href={`tel:${sub.contact_phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                          <Phone className="w-3 h-3" />
                          {sub.contact_phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {sub.contract_value ? `$${sub.contract_value.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell>
                    {insuranceStatus ? (
                      <span className={`text-sm ${insuranceStatus.color}`}>
                        {insuranceStatus.text}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderRating(sub.performance_rating)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteSubcontractor(sub.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredSubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No subcontractors found. Add subcontractors to track your project team.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Subcontractor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Subcontractor</DialogTitle>
            <DialogDescription>Add a new subcontractor to the project.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input 
                value={form.company_name}
                onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Trade *</Label>
              <Select 
                value={form.trade} 
                onValueChange={(v) => setForm(f => ({ ...f, trade: v as SubcontractorTrade }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBCONTRACTOR_TRADES.map(trade => (
                    <SelectItem key={trade} value={trade}>{TRADE_CONFIG[trade].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input 
                value={form.contact_name}
                onChange={(e) => setForm(f => ({ ...f, contact_name: e.target.value }))}
                placeholder="Primary contact"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Value (USD)</Label>
              <Input 
                type="number"
                value={form.contract_value}
                onChange={(e) => setForm(f => ({ ...f, contract_value: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Contract Date</Label>
              <Input 
                type="date"
                value={form.contract_date}
                onChange={(e) => setForm(f => ({ ...f, contract_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Insurance Expiry</Label>
              <Input 
                type="date"
                value={form.insurance_expiry}
                onChange={(e) => setForm(f => ({ ...f, insurance_expiry: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>WCB Expiry</Label>
              <Input 
                type="date"
                value={form.wcb_expiry}
                onChange={(e) => setForm(f => ({ ...f, wcb_expiry: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.company_name || isCreating}>
              Add Subcontractor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
