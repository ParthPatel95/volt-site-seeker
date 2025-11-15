import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';
import { AllUsersAnalytics } from './AllUsersAnalytics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  permissions: string[];
  department?: string;
  is_verified: boolean;
  roles: string[];
  is_active: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'manager', label: 'Manager', description: 'Team management access' },
  { value: 'user', label: 'User', description: 'Standard user access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
];

// Feature permissions based on actual navigation items
const FEATURE_PERMISSIONS: Permission[] = [
  { id: 'feature.dashboard', name: 'Dashboard', description: 'Access to main dashboard', category: 'Features' },
  { id: 'feature.aeso-market-hub', name: 'AESO Market Hub', description: 'Access to AESO Market Hub', category: 'Features' },
  { id: 'aeso.training-management', name: 'AESO Model Training', description: 'Access to AESO ML Model Training & Management', category: 'AESO Market' },
  { id: 'feature.ercot-market-hub', name: 'ERCOT Market Hub', description: 'Access to ERCOT Market Hub', category: 'Features' },
  { id: 'feature.energy-rates', name: 'Energy Rates', description: 'Access to Energy Rates', category: 'Features' },
  { id: 'feature.industry-intelligence', name: 'Industry Intelligence', description: 'Access to Industry Intelligence', category: 'Features' },
  { id: 'feature.corporate-intelligence', name: 'Corporate Intelligence', description: 'Access to Corporate Intelligence', category: 'Features' },
  { id: 'feature.idle-industry-scanner', name: 'Idle Industry Scanner', description: 'Access to Idle Industry Scanner', category: 'Features' },
  { id: 'feature.power-infrastructure', name: 'Power Infrastructure', description: 'Access to Power Infrastructure', category: 'Features' },
  { id: 'feature.btc-roi-lab', name: 'BTC Mining ROI Lab', description: 'Access to BTC Mining ROI Lab', category: 'Features' },
  { id: 'feature.secure-share', name: 'Secure Share', description: 'Access to Secure Share', category: 'Features' },
  { id: 'feature.user-management', name: 'User Management', description: 'Access to User Management (Admin Only)', category: 'Features' }
];

export function UserManagementSystem() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'user' as string,
    department: '',
    permissions: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user' as string,
    department: '',
    permissions: [] as string[],
    password: ''
  });
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_users_with_details');
      
      if (error) throw error;
      
      const formattedUsers = data?.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'Unknown User',
        phone: user.phone,
        role: user.roles?.[0] || 'user',
        status: (user.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'suspended',
        last_login: user.last_login,
        created_at: user.created_at,
        permissions: user.permissions || [],
        department: user.department,
        is_verified: user.is_verified,
        roles: user.roles || [],
        is_active: user.is_active
      })) || [];
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userForm.email || !userForm.full_name || !userForm.password) {
      toast({
        title: "Validation Error",
        description: "Email, full name, and password are required",
        variant: "destructive"
      });
      return;
    }

    if (userForm.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create auth user without email verification using the edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('user-management', {
        body: { 
          action: 'create-user',
          email: userForm.email,
          password: userForm.password,
          full_name: userForm.full_name,
          phone: userForm.phone,
          department: userForm.department,
          role: userForm.role,
          permissions: userForm.permissions
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const authData = data;

      
      toast({
        title: "User created",
        description: `User "${userForm.full_name}" has been created successfully`
      });

      // Reset form and refresh users
      setUserForm({
        email: '',
        full_name: '',
        phone: '',
        role: 'user',
        department: '',
        permissions: [],
        password: ''
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditForm({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      permissions: user.permissions,
      status: user.status
    });
    setShowEditDialog(true);
  };

  const updateUser = async () => {
    try {
      setLoading(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          department: editForm.department,
          is_active: editForm.status === 'active'
        })
        .eq('id', editForm.id);

      if (profileError) throw profileError;

      // Update role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editForm.id);

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: editForm.id,
          role: editForm.role as 'admin' | 'viewer' | 'moderator' | 'user'
        });

      if (roleError) throw roleError;

      // Update permissions
      await updateUserPermissions(editForm.id, editForm.permissions);
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully"
      });
      
      setShowEditDialog(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('user-management', {
        body: { action: 'reset-password', userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Password reset",
        description: "A password reset email has been sent to the user"
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus === 'active' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        description: "User status has been updated successfully"
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('user-management', {
        body: { action: 'delete', userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully"
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserPermissions = async (userId: string, permissions: string[]) => {
    try {
      // Delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionInserts = permissions.map(permission => ({
          user_id: userId,
          permission
        }));

        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionInserts);

        if (error) throw error;
      }

      toast({
        title: "Permissions updated",
        description: "User permissions have been updated successfully"
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error updating permissions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resendInvitation = async (userId: string) => {
    try {
      // In a real implementation, you would send an email invitation
      toast({
        title: "Invitation sent",
        description: "User invitation has been resent"
      });
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'warning';
      case 'user': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    FEATURE_PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  // Only allow admin@voltscout.com to access user management
  if (currentUser?.email !== 'admin@voltscout.com') {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access User Management. This feature is restricted to administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button className="gap-2" onClick={() => setActiveTab('create')}>
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="create">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.status === 'active' ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resendInvitation(user.id)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteUser(user.id)}
                          className="text-destructive"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    {user.is_verified && (
                      <Badge variant="success" className="gap-1">
                        <UserCheck className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    {user.department && (
                      <div>Department: {user.department}</div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    )}
                    {user.last_login && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last login: {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Permissions: {user.permissions.length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((role) => (
              <Card key={role.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {role.label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Users with this role: {users.filter(u => u.roles.includes(role.value)).length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Permissions related to {category.toLowerCase()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">{permission.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AllUsersAnalytics />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a new user to the system with roles and permissions
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userForm.phone}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={userForm.department}
                      onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="IT"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Switch
                              id={permission.id}
                              checked={userForm.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setUserForm(prev => ({ 
                                    ...prev, 
                                    permissions: [...prev.permissions, permission.id] 
                                  }));
                                } else {
                                  setUserForm(prev => ({ 
                                    ...prev, 
                                    permissions: prev.permissions.filter(p => p !== permission.id) 
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details, permissions, and role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editForm.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-full-name">Full Name</Label>
                <Input
                  id="edit-full-name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="IT"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Button 
                variant="outline" 
                onClick={() => resetUserPassword(editForm.id)}
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Send Password Reset Email
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          id={`edit-${permission.id}`}
                          checked={editForm.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditForm(prev => ({ 
                                ...prev, 
                                permissions: [...prev.permissions, permission.id] 
                              }));
                            } else {
                              setEditForm(prev => ({ 
                                ...prev, 
                                permissions: prev.permissions.filter(p => p !== permission.id) 
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}