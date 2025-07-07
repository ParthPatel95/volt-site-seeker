import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketLOI } from '@/hooks/useVoltMarketLOI';
import { 
  Scale, 
  Plus, 
  Send, 
  Eye,
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  MessageSquare,
  Calendar,
  DollarSign
} from 'lucide-react';

export const VoltMarketLOICenter: React.FC = () => {
  const { submitLOI, getLOIs, updateLOIStatus, loading } = useVoltMarketLOI();
  const [lois, setLois] = useState<any[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('received');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedLOI, setSelectedLOI] = useState<any>(null);

  // Create LOI form state
  const [createForm, setCreateForm] = useState({
    listingId: '',
    proposedPrice: '',
    proposedTerms: '',
    validUntil: '',
    contingencies: '',
    additionalNotes: ''
  });

  // Response form state
  const [responseForm, setResponseForm] = useState({
    status: 'accepted' as 'accepted' | 'rejected' | 'countered',
    responseNotes: '',
    counterOffer: ''
  });

  useEffect(() => {
    const loadLOIs = async () => {
      try {
        const data = await getLOIs();
        setLois(data || []);
      } catch (error) {
        console.error('Error loading LOIs:', error);
      }
    };
    loadLOIs();
  }, []);

  const handleSubmitLOI = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await submitLOI(createForm.listingId, {
        proposedPrice: parseFloat(createForm.proposedPrice),
        proposedTerms: createForm.proposedTerms,
        validUntil: createForm.validUntil,
        contingencies: createForm.contingencies,
        additionalNotes: createForm.additionalNotes
      });
      
      toast({
        title: "LOI submitted",
        description: "Your Letter of Intent has been submitted successfully"
      });
      
      setCreateForm({
        listingId: '',
        proposedPrice: '',
        proposedTerms: '',
        validUntil: '',
        contingencies: '',
        additionalNotes: ''
      });
      setShowCreateForm(false);
      const data = await getLOIs();
      setLois(data || []);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit LOI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRespondToLOI = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedLOI) return;

    try {
      await updateLOIStatus(selectedLOI.id, responseForm.status);
      
      toast({
        title: "Response sent",
        description: "Your response to the LOI has been sent successfully"
      });
      
      setResponseForm({
        status: 'accepted',
        responseNotes: '',
        counterOffer: ''
      });
      setShowResponseForm(false);
      setSelectedLOI(null);
      const data = await getLOIs();
      setLois(data || []);
    } catch (error) {
      toast({
        title: "Response failed",
        description: "Failed to send response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'countered': return <MessageSquare className="w-4 h-4" />;
      case 'expired': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const receivedLOIs = lois.filter(loi => loi.type === 'received');
  const sentLOIs = lois.filter(loi => loi.type === 'sent');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LOI Center</h1>
            <p className="text-gray-600 mt-1">Manage Letters of Intent for your energy infrastructure deals</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Submit LOI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Letter of Intent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitLOI} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listing-id">Listing ID</Label>
                    <Input
                      id="listing-id"
                      value={createForm.listingId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, listingId: e.target.value }))}
                      placeholder="Enter listing ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="proposed-price">Proposed Price ($)</Label>
                    <Input
                      id="proposed-price"
                      type="number"
                      value={createForm.proposedPrice}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, proposedPrice: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="proposed-terms">Proposed Terms</Label>
                  <Textarea
                    id="proposed-terms"
                    value={createForm.proposedTerms}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, proposedTerms: e.target.value }))}
                    placeholder="Describe your proposed terms and conditions"
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valid-until">Valid Until</Label>
                  <Input
                    id="valid-until"
                    type="date"
                    value={createForm.validUntil}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, validUntil: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contingencies">Contingencies</Label>
                  <Textarea
                    id="contingencies"
                    value={createForm.contingencies}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, contingencies: e.target.value }))}
                    placeholder="List any contingencies or conditions"
                  />
                </div>
                <div>
                  <Label htmlFor="additional-notes">Additional Notes</Label>
                  <Textarea
                    id="additional-notes"
                    value={createForm.additionalNotes}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any additional information"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Submit LOI
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total LOIs</p>
                  <p className="text-2xl font-bold text-gray-900">{lois.length}</p>
                </div>
                <Scale className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {lois.filter(loi => loi.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {lois.filter(loi => loi.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lois.filter(loi => new Date(loi.created_at).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LOI Lists */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50">
            <TabsTrigger value="received">Received LOIs ({receivedLOIs.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent LOIs ({sentLOIs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Received Letters of Intent</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading LOIs...</p>
                  </div>
                ) : receivedLOIs.length === 0 ? (
                  <div className="text-center py-12">
                    <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No received LOIs</h3>
                    <p className="text-gray-600">You haven't received any Letters of Intent yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedLOIs.map((loi) => (
                      <div key={loi.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">LOI #{loi.id.slice(0, 8)}</h3>
                            <Badge className={getStatusColor(loi.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(loi.status)}
                                {loi.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">From:</span> {loi.submitter?.company_name || 'Unknown'}
                            </div>
                            <div>
                              <span className="font-medium">Listing:</span> {loi.listing?.title || loi.listing_id}
                            </div>
                            <div>
                              <span className="font-medium">Proposed:</span> {formatCurrency(loi.proposed_price)}
                            </div>
                            <div>
                              <span className="font-medium">Valid Until:</span> {new Date(loi.valid_until).toLocaleDateString()}
                            </div>
                          </div>
                          {loi.proposed_terms && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{loi.proposed_terms}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLOI(loi);
                              setShowResponseForm(true);
                            }}
                            disabled={loi.status !== 'pending'}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Respond
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Sent Letters of Intent</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading LOIs...</p>
                  </div>
                ) : sentLOIs.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent LOIs</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any Letters of Intent yet</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First LOI
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentLOIs.map((loi) => (
                      <div key={loi.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">LOI #{loi.id.slice(0, 8)}</h3>
                            <Badge className={getStatusColor(loi.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(loi.status)}
                                {loi.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">To:</span> {loi.recipient?.company_name || 'Unknown'}
                            </div>
                            <div>
                              <span className="font-medium">Listing:</span> {loi.listing?.title || loi.listing_id}
                            </div>
                            <div>
                              <span className="font-medium">Proposed:</span> {formatCurrency(loi.proposed_price)}
                            </div>
                            <div>
                              <span className="font-medium">Valid Until:</span> {new Date(loi.valid_until).toLocaleDateString()}
                            </div>
                          </div>
                          {loi.proposed_terms && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{loi.proposed_terms}</p>
                          )}
                          {loi.response_notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                              <p className="text-sm text-gray-700">{loi.response_notes}</p>
                              {loi.counter_offer && (
                                <p className="text-sm text-gray-700 mt-1">
                                  <span className="font-medium">Counter Offer:</span> {formatCurrency(loi.counter_offer)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Response Dialog */}
        <Dialog open={showResponseForm} onOpenChange={setShowResponseForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respond to LOI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRespondToLOI} className="space-y-4">
              <div>
                <Label htmlFor="response-status">Response</Label>
                <select
                  id="response-status"
                  value={responseForm.status}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                  <option value="countered">Counter Offer</option>
                </select>
              </div>
              
              {responseForm.status === 'countered' && (
                <div>
                  <Label htmlFor="counter-offer">Counter Offer ($)</Label>
                  <Input
                    id="counter-offer"
                    type="number"
                    value={responseForm.counterOffer}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, counterOffer: e.target.value }))}
                    placeholder="Enter counter offer amount"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="response-notes">Response Notes</Label>
                <Textarea
                  id="response-notes"
                  value={responseForm.responseNotes}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, responseNotes: e.target.value }))}
                  placeholder="Add any additional notes or explanations"
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowResponseForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Send Response
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};