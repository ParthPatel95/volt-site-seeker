import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Building2, Users, FileText, Award, Filter, DollarSign, Clock, Trash2, Eye } from 'lucide-react';
import { useVendors } from './hooks/useVendors';
import { useBidRequests } from './hooks/useBidRequests';
import { useBids } from './hooks/useBids';
import { useContractAwards } from './hooks/useContractAwards';
import { 
  Vendor, 
  BidRequest, 
  Bid,
  VENDOR_TRADES, 
  VendorTrade,
  BID_REQUEST_STATUS_CONFIG,
  BID_STATUS_CONFIG,
} from '../types/voltbuild-phase2.types';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format } from 'date-fns';

interface VoltBidsTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltBidsTab({ project, phases }: VoltBidsTabProps) {
  const [activeTab, setActiveTab] = useState<'vendors' | 'requests' | 'contracts'>('vendors');
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState<VendorTrade | 'all'>('all');
  
  // Dialogs
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [bidRequestDialogOpen, setBidRequestDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedBidRequest, setSelectedBidRequest] = useState<BidRequest | null>(null);
  const [bidComparisonOpen, setBidComparisonOpen] = useState(false);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  // Form states
  const [vendorForm, setVendorForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    trade: 'Other' as VendorTrade,
    regions: [] as string[],
    certifications: [] as string[],
  });
  
  const [bidRequestForm, setBidRequestForm] = useState({
    title: '',
    scope_of_work: '',
    phase_id: '',
    due_date: '',
  });

  const [bidForm, setBidForm] = useState({
    vendor_id: '',
    amount: '',
    timeline_days: '',
    assumptions: '',
    exclusions: '',
  });

  const [awardForm, setAwardForm] = useState({
    start_date: '',
    end_date: '',
    notes: '',
  });

  // Hooks
  const { vendors, createVendor, deleteVendor, filterVendors, isCreating: isCreatingVendor } = useVendors();
  const { bidRequests, createBidRequest, deleteBidRequest, isCreating: isCreatingBidRequest } = useBidRequests(project.id);
  const { bids, createBid, getHighlights, isCreating: isCreatingBid } = useBids(selectedBidRequest?.id || null);
  const { contractAwards, createContractAward, isCreating: isCreatingAward } = useContractAwards(project.id);

  const filteredVendors = filterVendors(
    vendors,
    tradeFilter === 'all' ? undefined : tradeFilter,
    undefined,
    searchTerm
  );

  const handleCreateVendor = () => {
    createVendor({
      ...vendorForm,
      insurance_docs_url: null,
      notes: null,
    });
    setVendorDialogOpen(false);
    setVendorForm({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      trade: 'Other',
      regions: [],
      certifications: [],
    });
  };

  const handleCreateBidRequest = () => {
    createBidRequest({
      project_id: project.id,
      title: bidRequestForm.title,
      scope_of_work: bidRequestForm.scope_of_work,
      phase_id: bidRequestForm.phase_id || null,
      task_id: null,
      due_date: bidRequestForm.due_date || null,
      status: 'draft',
      attachments: [],
      invited_vendor_ids: [],
    });
    setBidRequestDialogOpen(false);
    setBidRequestForm({ title: '', scope_of_work: '', phase_id: '', due_date: '' });
  };

  const handleCreateBid = () => {
    if (!selectedBidRequest) return;
    createBid({
      bid_request_id: selectedBidRequest.id,
      vendor_id: bidForm.vendor_id,
      amount: parseFloat(bidForm.amount) || 0,
      currency: 'USD',
      timeline_days: parseInt(bidForm.timeline_days) || null,
      assumptions: bidForm.assumptions || null,
      exclusions: bidForm.exclusions || null,
      attachments: [],
      status: 'submitted',
    });
    setBidDialogOpen(false);
    setBidForm({ vendor_id: '', amount: '', timeline_days: '', assumptions: '', exclusions: '' });
  };

  const handleAwardContract = () => {
    if (!selectedBidRequest || !selectedBid) return;
    createContractAward({
      project_id: project.id,
      bid_request_id: selectedBidRequest.id,
      vendor_id: selectedBid.vendor_id,
      awarded_amount: selectedBid.amount,
      start_date: awardForm.start_date || null,
      end_date: awardForm.end_date || null,
      terms_url: null,
      notes: awardForm.notes || null,
    });
    setAwardDialogOpen(false);
    setBidComparisonOpen(false);
    setAwardForm({ start_date: '', end_date: '', notes: '' });
  };

  const highlights = getHighlights();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="vendors" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Bid Requests</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Contracts</span>
          </TabsTrigger>
        </TabsList>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[250px]"
                />
              </div>
              <Select value={tradeFilter} onValueChange={(v) => setTradeFilter(v as typeof tradeFilter)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {VENDOR_TRADES.map(trade => (
                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setVendorDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map(vendor => (
              <Card key={vendor.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vendor.company_name}</CardTitle>
                      <CardDescription>{vendor.contact_name}</CardDescription>
                    </div>
                    <Badge variant="outline">{vendor.trade}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {vendor.email && <p className="text-muted-foreground">{vendor.email}</p>}
                  {vendor.phone && <p className="text-muted-foreground">{vendor.phone}</p>}
                  {vendor.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vendor.certifications.map((cert, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{cert}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => deleteVendor(vendor.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredVendors.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No vendors found. Add your first vendor to get started.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bid Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setBidRequestDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Bid Request
            </Button>
          </div>

          <div className="space-y-4">
            {bidRequests.map(request => (
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription>
                        {request.phase_id && <span>Phase: {request.phase_id} • </span>}
                        Due: {request.due_date ? format(new Date(request.due_date), 'MMM d, yyyy') : 'No deadline'}
                      </CardDescription>
                    </div>
                    <Badge variant={BID_REQUEST_STATUS_CONFIG[request.status].variant}>
                      {BID_REQUEST_STATUS_CONFIG[request.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.scope_of_work && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {request.scope_of_work}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedBidRequest(request);
                        setBidComparisonOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Bids
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedBidRequest(request);
                        setBidDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bid
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteBidRequest(request.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {bidRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No bid requests yet. Create your first bid request to start collecting vendor bids.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="space-y-4">
            {contractAwards.map(award => (
              <Card key={award.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {award.vendor?.company_name || 'Unknown Vendor'}
                      </CardTitle>
                      <CardDescription>
                        {award.bid_request?.title || 'Contract Award'}
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {award.awarded_amount.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    {award.start_date && <span>Start: {format(new Date(award.start_date), 'MMM d, yyyy')}</span>}
                    {award.end_date && <span>End: {format(new Date(award.end_date), 'MMM d, yyyy')}</span>}
                  </div>
                  {award.notes && <p className="mt-2">{award.notes}</p>}
                </CardContent>
              </Card>
            ))}
            {contractAwards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No contracts awarded yet. Compare bids and award contracts from the Bid Requests tab.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>Add a new vendor to your directory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input 
                value={vendorForm.company_name}
                onChange={(e) => setVendorForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input 
                  value={vendorForm.contact_name}
                  onChange={(e) => setVendorForm(f => ({ ...f, contact_name: e.target.value }))}
                  placeholder="Contact person"
                />
              </div>
              <div className="space-y-2">
                <Label>Trade *</Label>
                <Select 
                  value={vendorForm.trade} 
                  onValueChange={(v) => setVendorForm(f => ({ ...f, trade: v as VendorTrade }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_TRADES.map(trade => (
                      <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateVendor} disabled={!vendorForm.company_name || isCreatingVendor}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Bid Request Dialog */}
      <Dialog open={bidRequestDialogOpen} onOpenChange={setBidRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Bid Request</DialogTitle>
            <DialogDescription>Create a bid request to collect vendor proposals.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input 
                value={bidRequestForm.title}
                onChange={(e) => setBidRequestForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Electrical Installation Phase 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phase</Label>
                <Select 
                  value={bidRequestForm.phase_id} 
                  onValueChange={(v) => setBidRequestForm(f => ({ ...f, phase_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map(phase => (
                      <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={bidRequestForm.due_date}
                  onChange={(e) => setBidRequestForm(f => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Scope of Work</Label>
              <Textarea 
                value={bidRequestForm.scope_of_work}
                onChange={(e) => setBidRequestForm(f => ({ ...f, scope_of_work: e.target.value }))}
                placeholder="Describe the work to be performed..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBidRequest} disabled={!bidRequestForm.title || isCreatingBidRequest}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bid</DialogTitle>
            <DialogDescription>Record a vendor's bid for this request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select 
                value={bidForm.vendor_id} 
                onValueChange={(v) => setBidForm(f => ({ ...f, vendor_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (USD) *</Label>
                <Input 
                  type="number"
                  value={bidForm.amount}
                  onChange={(e) => setBidForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline (Days)</Label>
                <Input 
                  type="number"
                  value={bidForm.timeline_days}
                  onChange={(e) => setBidForm(f => ({ ...f, timeline_days: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assumptions</Label>
              <Textarea 
                value={bidForm.assumptions}
                onChange={(e) => setBidForm(f => ({ ...f, assumptions: e.target.value }))}
                placeholder="Key assumptions in this bid..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Exclusions</Label>
              <Textarea 
                value={bidForm.exclusions}
                onChange={(e) => setBidForm(f => ({ ...f, exclusions: e.target.value }))}
                placeholder="What's not included..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBid} disabled={!bidForm.vendor_id || !bidForm.amount || isCreatingBid}>
              Add Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid Comparison Sheet */}
      <Sheet open={bidComparisonOpen} onOpenChange={setBidComparisonOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedBidRequest?.title}</SheetTitle>
            <SheetDescription>Compare and select the winning bid</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-200px)] mt-6">
            {bids.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map(bid => (
                    <TableRow key={bid.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bid.vendor?.company_name || 'Unknown'}</p>
                          {bid.assumptions && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{bid.assumptions}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {highlights.lowestCostId === bid.id && (
                            <Badge variant="default" className="text-xs">Lowest</Badge>
                          )}
                          <span className="font-mono">${bid.amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {highlights.fastestTimelineId === bid.id && (
                            <Badge variant="secondary" className="text-xs">Fastest</Badge>
                          )}
                          {bid.timeline_days ? `${bid.timeline_days} days` : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={BID_STATUS_CONFIG[bid.status].variant}>
                          {BID_STATUS_CONFIG[bid.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bid.status !== 'awarded' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedBid(bid);
                              setAwardDialogOpen(true);
                            }}
                          >
                            Award
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No bids received yet for this request.
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Award Contract Dialog */}
      <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Contract</DialogTitle>
            <DialogDescription>
              Award this contract to {selectedBid?.vendor?.company_name} for ${selectedBid?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date"
                  value={awardForm.start_date}
                  onChange={(e) => setAwardForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  value={awardForm.end_date}
                  onChange={(e) => setAwardForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={awardForm.notes}
                onChange={(e) => setAwardForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Contract notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAwardContract} disabled={isCreatingAward}>
              <Award className="w-4 h-4 mr-2" />
              Award Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
