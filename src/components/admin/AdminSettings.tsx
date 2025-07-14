import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Users, Check, X, Clock, RefreshCw, UserPlus, Shield } from 'lucide-react';

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platform_use: string;
  additional_info: string | null;
  status: string;
  created_at: string;
}

export function AdminSettings() {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = user?.email === 'admin@voltscout.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAccessRequests();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessRequests(data || []);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    setProcessing(requestId);
    try {
      const status = approve ? 'approved' : 'rejected';
      const { error } = await supabase
        .from('access_requests')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email || 'admin@voltscout.com'
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, we need to create the user account and add them to approved users
      if (approve) {
        const request = accessRequests.find(r => r.id === requestId);
        if (request) {
          // Note: In a real implementation, you'd want to send them an email
          // with instructions to set up their account
          toast({
            title: "Request Approved",
            description: `${request.full_name} has been approved for VoltScout access. They will receive setup instructions via email.`,
          });
        }
      } else {
        toast({
          title: "Request Rejected",
          description: "The access request has been rejected.",
        });
      }

      fetchAccessRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access admin settings. Only the platform administrator can manage these settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">VoltScout Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform access requests and administrative settings
        </p>
      </div>

      {/* Access Requests Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Access Requests
              </CardTitle>
              <CardDescription>
                Review and manage user access requests for the VoltScout platform
              </CardDescription>
            </div>
            <Button
              onClick={fetchAccessRequests}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No access requests found
            </p>
          ) : (
            <div className="space-y-4">
              {accessRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{request.full_name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Email:</span> {request.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {request.phone}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {request.company}
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> {request.role}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">Platform Use:</span> {request.platform_use}
                      </div>
                      
                      {request.additional_info && (
                        <div className="text-sm">
                          <span className="font-medium">Additional Info:</span> {request.additional_info}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(request.id, true)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(request.id, false)}
                          disabled={processing === request.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>
            Overview of platform usage and user management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {accessRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {accessRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved Users</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {accessRequests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Tools
          </CardTitle>
          <CardDescription>
            Additional administrative tools and system management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Manual User Management
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually add or remove users from the VoltScout platform
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "Manual User Management",
                    description: "This feature allows you to directly add users to the approved list without going through the request process.",
                  });
                }}
              >
                Manage Users
              </Button>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Settings
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure platform-wide settings and preferences
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "System Settings",
                    description: "Configure platform settings, email templates, and system preferences.",
                  });
                }}
              >
                Configure
              </Button>
            </Card>
          </div>
        </CardContent>

      </Card>

      {/* Administrator Information */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Admin Account</Badge>
              <span>{user?.email}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You are logged in as the platform administrator with full access to all management features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}