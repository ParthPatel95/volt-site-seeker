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
  Unlock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  permissions: string[];
  department?: string;
  is_verified: boolean;
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

const PERMISSIONS: Permission[] = [
  { id: 'users.read', name: 'View Users', description: 'Can view user information', category: 'Users' },
  { id: 'users.write', name: 'Manage Users', description: 'Can create and edit users', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'Users' },
  { id: 'analytics.read', name: 'View Analytics', description: 'Can view analytics dashboards', category: 'Analytics' },
  { id: 'analytics.export', name: 'Export Analytics', description: 'Can export analytics data', category: 'Analytics' },
  { id: 'reports.read', name: 'View Reports', description: 'Can view generated reports', category: 'Reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can create new reports', category: 'Reports' },
  { id: 'listings.read', name: 'View Listings', description: 'Can view all listings', category: 'Listings' },
  { id: 'listings.write', name: 'Manage Listings', description: 'Can create and edit listings', category: 'Listings' },
  { id: 'documents.read', name: 'View Documents', description: 'Can view documents', category: 'Documents' },
  { id: 'documents.write', name: 'Manage Documents', description: 'Can upload and manage documents', category: 'Documents' }
];

export function UserManagementSystem() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user' as User['role'],
    department: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulate fetching users from database
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@wattbyte.com',
          full_name: 'System Administrator',
          phone: '+1-555-0101',
          role: 'admin',
          status: 'active',
          last_login: '2024-01-25T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          permissions: ['users.read', 'users.write', 'users.delete', 'analytics.read', 'analytics.export'],
          department: 'IT',
          is_verified: true
        },
        {
          id: '2',
          email: 'manager@wattbyte.com',
          full_name: 'John Manager',
          phone: '+1-555-0102',
          role: 'manager',
          status: 'active',
          last_login: '2024-01-24T15:45:00Z',
          created_at: '2024-01-05T00:00:00Z',
          permissions: ['users.read', 'analytics.read', 'reports.read', 'reports.create'],
          department: 'Operations',
          is_verified: true
        },
        {
          id: '3',
          email: 'user@example.com',
          full_name: 'Jane User',
          role: 'user',
          status: 'active',
          last_login: '2024-01-23T09:15:00Z',
          created_at: '2024-01-10T00:00:00Z',
          permissions: ['listings.read', 'documents.read'],
          department: 'Sales',
          is_verified: false
        },
        {
          id: '4',
          email: 'viewer@example.com',
          full_name: 'Bob Viewer',
          role: 'viewer',
          status: 'inactive',
          created_at: '2024-01-15T00:00:00Z',
          permissions: ['listings.read'],
          department: 'Marketing',
          is_verified: true
        }
      ];
      setUsers(mockUsers);
    } catch (error: any) {
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
    setLoading(true);
    
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: userForm.email,
        full_name: userForm.full_name,
        phone: userForm.phone,
        role: userForm.role,
        status: 'active',
        created_at: new Date().toISOString(),
        permissions: userForm.permissions,
        department: userForm.department,
        is_verified: false
      };

      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: "User created",
        description: `User "${userForm.full_name}" has been created successfully`
      });

      // Reset form
      setUserForm({
        email: '',
        full_name: '',
        phone: '',
        role: 'user',
        department: '',
        permissions: []
      });
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(userId, { status: newStatus });
  };

  const deleteUser = async (userId: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserPermissions = async (userId: string, permissions: string[]) => {
    await updateUser(userId, { permissions });
  };

  const resendInvitation = async (userId: string) => {
    toast({
      title: "Invitation sent",
      description: "User invitation has been resent"
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'warning';
      case 'user': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
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
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
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
                    Users with this role: {users.filter(u => u.role === role.value).length}
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
                <CardTitle>{category} Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
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

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create New User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address..."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      value={userForm.phone}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Input
                      id="department"
                      value={userForm.department}
                      onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value as User['role'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label} - {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Switch
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
                              <div>
                                <div className="text-sm font-medium">{permission.name}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}