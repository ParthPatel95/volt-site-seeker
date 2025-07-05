
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, User, Search, TrendingUp, AlertTriangle } from 'lucide-react';

export const VoltMarketDashboard: React.FC = () => {
  const { profile, user, loading, createProfile } = useVoltMarketAuth();

  const handleCreateProfile = async () => {
    if (!user) return;
    
    try {
      // Try to create a basic buyer profile if none exists
      const result = await createProfile(user.id, { role: 'buyer' });
      
      if (result.error) {
        // If duplicate key error, the profile already exists - try to fetch it
        if (result.error.message?.includes('duplicate key')) {
          console.log('Profile already exists, refreshing...');
          window.location.reload(); // Simple reload to refresh the profile state
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Link to="/voltmarket/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Setup Required</h2>
          <p className="text-gray-600 mb-6">
            It looks like your profile wasn't created properly. Let's set that up now.
          </p>
          <Button onClick={handleCreateProfile} className="mb-4">
            Create Profile
          </Button>
          <div className="text-sm text-gray-500">
            Or go to{' '}
            <Link to="/voltmarket/profile" className="text-blue-600 hover:underline">
              Profile Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{profile.company_name ? `, ${profile.company_name}` : ''}!
          </h1>
          <p className="text-gray-600">
            Your VoltMarket {profile.role} dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                listings currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                unread messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.is_id_verified && profile.is_email_verified ? '✓' : '!'}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.is_id_verified && profile.is_email_verified ? 'Fully verified' : 'Needs verification'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/voltmarket/listings">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Listings
                </Button>
              </Link>
              
              {profile.role === 'seller' && (
                <Link to="/voltmarket/create-listing">
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Listing
                  </Button>
                </Link>
              )}
              
              <Link to="/voltmarket/messages">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Messages
                </Button>
              </Link>
              
              <Link to="/voltmarket/profile">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!profile.is_email_verified && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800">Verify Your Email</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Check your email and click the verification link to complete your account setup.
                    </p>
                  </div>
                )}
                
                {!profile.company_name && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800">Complete Your Profile</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Add your company information to build trust with other users.
                    </p>
                    <Link to="/voltmarket/profile">
                      <Button size="sm" className="mt-2">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                )}
                
                {profile.role === 'seller' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800">Create Your First Listing</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Start selling by creating your first listing on VoltMarket.
                    </p>
                    <Link to="/voltmarket/create-listing">
                      <Button size="sm" className="mt-2">
                        Create Listing
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
