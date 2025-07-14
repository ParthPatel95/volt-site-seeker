import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Users, Check, X, Clock, RefreshCw, UserPlus, Shield, UserMinus, Mail, Trash2, Save } from 'lucide-react';

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

interface ApprovedUser {
  id: string;
  user_id: string;
  approved_at: string;
  notes: string | null;
}

export function AdminSettings() {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserNotes, setNewUserNotes] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = user?.email === 'admin@voltscout.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAccessRequests();
      fetchApprovedUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchApprovedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('voltscout_approved_users')
        .select('*')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      setApprovedUsers(data || []);
    } catch (error) {
      console.error('Error fetching approved users:', error);
    }
  };

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

  const addUserManually = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setProcessing('add-user');
    try {
      // First check if the user exists in auth.users
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newUserEmail.trim())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // If user doesn't exist, they need to create an account first
      if (!existingUser) {
        toast({
          title: "User Not Found",
          description: "This user needs to create an account first before being added to VoltScout.",
          variant: "destructive",
        });
        return;
      }

      // Add user to approved list
      const { error } = await supabase
        .from('voltscout_approved_users')
        .insert([{
          user_id: existingUser.id,
          notes: newUserNotes.trim() || null,
          approved_by: user?.id
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "User Already Approved",
            description: "This user is already approved for VoltScout access.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "User Added",
        description: `${newUserEmail} has been manually added to VoltScout.`,
      });

      setNewUserEmail('');
      setNewUserNotes('');
      fetchApprovedUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user to approved list",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const removeUser = async (userId: string) => {
    setProcessing(userId);
    try {
      const { error } = await supabase
        .from('voltscout_approved_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Removed",
        description: "User has been removed from VoltScout access.",
      });

      fetchApprovedUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user",
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Manual User Management
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUserManagement(!showUserManagement)}
                >
                  {showUserManagement ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showUserManagement && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Add User by Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userNotes">Notes (Optional)</Label>
                    <Textarea
                      id="userNotes"
                      placeholder="Add any notes about this user..."
                      value={newUserNotes}
                      onChange={(e) => setNewUserNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    onClick={addUserManually}
                    disabled={processing === 'add-user'}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {processing === 'add-user' ? 'Adding...' : 'Add User'}
                  </Button>
                  
                  {/* Current Approved Users */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Currently Approved Users ({approvedUsers.length})</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {approvedUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No approved users yet</p>
                      ) : (
                        approvedUsers.map((approvedUser) => (
                          <div key={approvedUser.id} className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                            <span>{approvedUser.user_id}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeUser(approvedUser.user_id)}
                              disabled={processing === approvedUser.user_id}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  System Settings
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSystemSettings(!showSystemSettings)}
                >
                  {showSystemSettings ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showSystemSettings && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Configure email settings</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Platform Settings</h4>
                        <p className="text-sm text-muted-foreground">General platform configuration</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Data Export</h4>
                        <p className="text-sm text-muted-foreground">Export platform data</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Save className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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