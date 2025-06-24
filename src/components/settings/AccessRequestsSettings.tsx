
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Building, User, Calendar, FileText, MapPin, Zap } from 'lucide-react';

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platform_use: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface SiteAccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  power_requirement: string;
  location: string;
  status: string;
  created_at: string;
}

export function AccessRequestsSettings() {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [siteAccessRequests, setSiteAccessRequests] = useState<SiteAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccessRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access requests:', error);
        toast({
          title: "Error",
          description: "Failed to load access requests",
          variant: "destructive"
        });
        return;
      }

      // Type cast the data to ensure status field matches our interface
      const typedData = (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      }));

      setAccessRequests(typedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive"
      });
    }
  };

  const fetchSiteAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('site_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching site access requests:', error);
        toast({
          title: "Error",
          description: "Failed to load site access requests",
          variant: "destructive"
        });
        return;
      }

      setSiteAccessRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load site access requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin' // In a real app, this would be the current user's ID
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request:', error);
        toast({
          title: "Error",
          description: "Failed to update request status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Request ${status} successfully`,
      });

      // Refresh the data
      fetchAccessRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAccessRequests();
    fetchSiteAccessRequests();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');
  const approvedRequests = accessRequests.filter(req => req.status === 'approved');
  const rejectedRequests = accessRequests.filter(req => req.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading access requests...</p>
        </div>
      </div>
    );
  }

  const AccessRequestCard = ({ request }: { request: AccessRequest }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <User className="w-5 h-5 mr-2" />
            {request.full_name}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.phone}</span>
          </div>
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.company}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.role}</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Platform Use:</span>
          </div>
          <p className="text-sm text-gray-700 ml-6">{request.platform_use}</p>
        </div>

        {request.additional_info && (
          <div>
            <div className="flex items-center mb-1">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium">Additional Info:</span>
            </div>
            <p className="text-sm text-gray-700 ml-6">{request.additional_info}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(request.created_at)}
          </div>
          
          {request.status === 'pending' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => updateRequestStatus(request.id, 'approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateRequestStatus(request.id, 'rejected')}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SiteAccessRequestCard = ({ request }: { request: SiteAccessRequest }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            {request.full_name}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.phone}</span>
          </div>
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.company_name}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{request.location}</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Zap className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Power Requirement:</span>
          </div>
          <p className="text-sm text-gray-700 ml-6">{request.power_requirement}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(request.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Access Requests Management</h2>
        <p className="text-gray-600">
          Manage all access requests from users who want to join the VoltScout platform and view our pipeline.
        </p>
      </div>

      <Tabs defaultValue="app-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="app-requests">
            App Access Requests ({accessRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline-requests">
            Pipeline Requests ({siteAccessRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="app-requests" className="mt-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {pendingRequests.map((request) => (
                    <AccessRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {approvedRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No approved requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {approvedRequests.map((request) => (
                    <AccessRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {rejectedRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No rejected requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {rejectedRequests.map((request) => (
                    <AccessRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="pipeline-requests" className="mt-6">
          {siteAccessRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No pipeline requests</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {siteAccessRequests.map((request) => (
                <SiteAccessRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
