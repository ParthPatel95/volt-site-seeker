import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useVoltMarketListings } from '@/hooks/useVoltMarketListings';
import { useToast } from '@/hooks/use-toast';
import { EmailVerificationBanner } from './EmailVerificationBanner';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, User, Search, TrendingUp, AlertTriangle, Edit, Trash2, Eye, EyeOff, Mail, FileCheck, HandHeart, Clock, Star, ShoppingCart, Heart, DollarSign, BarChart3, Users } from 'lucide-react';
import { VoltMarketAccessRequests } from './VoltMarketAccessRequests';
import { useVoltMarketAccessRequests } from '@/hooks/useVoltMarketAccessRequests';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper component for resending verification emails
const ResendVerificationButton: React.FC = () => {
  const { resendEmailVerification } = useVoltMarketAuth();
  const { toast } = useToast();
  const [sending, setSending] = React.useState(false);

  const handleResend = async () => {
    setSending(true);
    const { error } = await resendEmailVerification();
    
    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link."
      });
    }
    setSending(false);
  };

  return (
    <Button 
      onClick={handleResend} 
      disabled={sending}
      size="sm"
      variant="outline"
      className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
    >
      <Mail className="w-4 h-4 mr-2" />
      {sending ? 'Sending...' : 'Resend Verification Email'}
    </Button>
  );
};

// Seller Dashboard Component
const SellerDashboard: React.FC<{ profile: any }> = ({ profile }) => {
  const { userListings, fetchUserListings, deleteListing, updateListingStatus, loading: listingsLoading } = useVoltMarketListings();
  const { fetchAccessRequests } = useVoltMarketAccessRequests();
  const { toast } = useToast();
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingLOIs, setPendingLOIs] = useState(0);
  const [pendingDocumentRequests, setPendingDocumentRequests] = useState(0);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showMessageDetails, setShowMessageDetails] = useState(false);

  const fetchSellerMetrics = async () => {
    try {
      // Get messages and unread count
      const { data: messages, count: messageCount } = await supabase
        .from('voltmarket_contact_messages')
        .select('*, voltmarket_listings(title)')
        .eq('listing_owner_id', profile.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setUnreadMessages(messageCount || 0);
      setContactMessages(messages || []);

      // Get pending LOIs
      const { count: loiCount } = await supabase
        .from('voltmarket_lois')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', profile.id)
        .eq('status', 'pending');

      setPendingLOIs(loiCount || 0);

      // Get pending document requests
      const { count: docCount } = await supabase
        .from('voltmarket_document_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('granted_by', profile.id)
        .is('granted_at', null);

      setPendingDocumentRequests(docCount || 0);

      // Get total views for all listings
      const { data: listings } = await supabase
        .from('voltmarket_listings')
        .select('views_count')
        .eq('seller_id', profile.id);

      const views = listings?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0;
      setTotalViews(views);

    } catch (error) {
      console.error('Error fetching seller metrics:', error);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchUserListings(profile.id);
      fetchAccessRequests(profile.id);
      fetchSellerMetrics();
    }
  }, [profile?.id]);

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteListing(listingId);
    if (result.success) {
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully"
      });
    } else {
      toast({
        title: "Delete failed",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const result = await updateListingStatus(listingId, newStatus as "active" | "inactive");
    
    if (result.success) {
      toast({
        title: "Status updated",  
        description: `Listing is now ${newStatus}`
      });
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update listing status",
        variant: "destructive"
      });
    }
  };

  const activeListings = userListings.filter(listing => listing.status === 'active').length;

  return (
    <>
      {/* Seller Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">
              of {userListings.length} total listings
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setShowMessageDetails(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground truncate">
              {contactMessages.length > 0 && `Latest: ${contactMessages[0]?.sender_name}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              across all listings
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending LOIs</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{pendingLOIs}</div>
            <p className="text-xs text-muted-foreground">
              need your response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Listings Management */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg sm:text-xl">Your Listings ({userListings.length})</CardTitle>
            <Link to="/voltmarket/create-listing">
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Listing
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading your listings...</p>
              </div>
            ) : userListings.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">Create your first listing to start selling</p>
                <Link to="/voltmarket/create-listing">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                 {userListings.slice(0, 5).map((listing) => (
                   <div key={listing.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                       <div className="flex-1 min-w-0">
                         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 mb-2">
                           <h3 className="font-semibold text-base sm:text-lg truncate">{listing.title}</h3>
                           <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="self-start">
                             {listing.status}
                           </Badge>
                         </div>
                         <p className="text-gray-600 mb-2 line-clamp-2 text-sm sm:text-base">{listing.description}</p>
                         <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                           <span>${listing.asking_price?.toLocaleString()}</span>
                           <span>{listing.power_capacity_mw} MW</span>
                           <span className="truncate max-w-32">{listing.location}</span>
                           <span className="hidden sm:inline">Created {new Date(listing.created_at).toLocaleDateString()}</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-1 sm:gap-2 sm:ml-4 flex-shrink-0">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleToggleStatus(listing.id, listing.status)}
                           className="text-xs sm:text-sm"
                         >
                           {listing.status === 'active' ? (
                             <><EyeOff className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /> <span className="hidden sm:inline">Hide</span></>
                           ) : (
                             <><Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /> <span className="hidden sm:inline">Show</span></>
                           )}
                         </Button>
                         <Link to={`/voltmarket/edit-listing/${listing.id}`}>
                           <Button variant="outline" size="sm">
                             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                         </Link>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteListing(listing.id, listing.title)}
                           className="text-red-600 hover:text-red-800 hover:bg-red-50"
                         >
                           <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
                {userListings.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/voltmarket/dashboard">
                      <Button variant="outline">View All Listings</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/voltmarket/create-listing">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Listing
              </Button>
            </Link>
            
            <Link to="/voltmarket/loi-center">
              <Button variant="outline" className="w-full justify-start">
                <HandHeart className="mr-2 h-4 w-4" />
                Manage LOIs ({pendingLOIs})
              </Button>
            </Link>
            
            <Link to="/voltmarket/contact-messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Messages ({unreadMessages})
              </Button>
            </Link>
            
            <Link to="/voltmarket/document-requests">
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                Document Requests ({pendingDocumentRequests})
              </Button>
            </Link>

            <Link to="/voltmarket/dashboard">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics & Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Access Requests Section */}
      <div className="mt-8">
        <VoltMarketAccessRequests sellerId={profile.id} />
      </div>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDetails} onOpenChange={setShowMessageDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recent Messages ({unreadMessages} unread)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {contactMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent messages</p>
            ) : (
              contactMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{message.sender_name}</h4>
                      <p className="text-sm text-gray-500">{message.sender_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {message.voltmarket_listings?.title}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700">{message.message}</p>
                  {message.sender_phone && (
                    <p className="text-sm text-gray-500 mt-2">
                      Phone: {message.sender_phone}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Link to="/voltmarket/contact-messages">
              <Button>View All Messages</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Buyer Dashboard Component
const BuyerDashboard: React.FC<{ profile: any }> = ({ profile }) => {
  const { toast } = useToast();
  const [savedSearches, setSavedSearches] = useState(0);
  const [activeLOIs, setActiveLOIs] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [recentViews, setRecentViews] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  const fetchBuyerMetrics = async () => {
    try {
      // Get active LOIs submitted by buyer
      const { count: loiCount } = await supabase
        .from('voltmarket_lois')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', profile.id)
        .eq('status', 'pending');

      setActiveLOIs(loiCount || 0);

      // Get saved searches count (assuming we have this table)
      const { count: searchCount } = await supabase
        .from('search_criteria')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_active', true);

      setSavedSearches(searchCount || 0);

      // Get recent listings for browsing
      const { data: listings } = await supabase
        .from('voltmarket_listings')
        .select('*, voltmarket_profiles(company_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentListings(listings || []);

    } catch (error) {
      console.error('Error fetching buyer metrics:', error);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchBuyerMetrics();
    }
  }, [profile?.id]);

  return (
    <>
      {/* Buyer Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active LOIs</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLOIs}</div>
            <p className="text-xs text-muted-foreground">
              letters of intent submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedSearches}</div>
            <p className="text-xs text-muted-foreground">
              active search alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistCount}</div>
            <p className="text-xs text-muted-foreground">
              saved listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViews}</div>
            <p className="text-xs text-muted-foreground">
              listings viewed this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Listings</CardTitle>
            <Link to="/voltmarket/listings">
              <Button size="sm" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Browse All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">Browse available listings to get started</p>
                <Link to="/voltmarket/listings">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Browse Listings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{listing.title}</h3>
                          <Badge variant="default">New</Badge>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{listing.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>${listing.asking_price?.toLocaleString()}</span>
                          <span>{listing.power_capacity_mw} MW</span>
                          <span>{listing.location}</span>
                          <span>by {listing.voltmarket_profiles?.company_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/voltmarket/listings/${listing.id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buyer Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/voltmarket/listings">
              <Button className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Browse Listings
              </Button>
            </Link>
            
            <Link to="/voltmarket/search">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Advanced Search
              </Button>
            </Link>
            
            <Link to="/voltmarket/loi-center">
              <Button variant="outline" className="w-full justify-start">
                <HandHeart className="mr-2 h-4 w-4" />
                My LOIs ({activeLOIs})
              </Button>
            </Link>
            
            <Link to="/voltmarket/watchlist">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Watchlist ({watchlistCount})
              </Button>
            </Link>

            <Link to="/voltmarket/search">
              <Button variant="outline" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                Advanced Search
              </Button>
            </Link>

            <Link to="/voltmarket/notifications">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Notifications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Main Dashboard Component
export const VoltMarketDashboard: React.FC = () => {
  const { profile, user, loading, createProfile } = useVoltMarketAuth();
  const { toast } = useToast();

  const handleCreateProfile = async () => {
    if (!user) return;
    
    try {
      const result = await createProfile(user.id, { role: 'buyer' });
      
      if (result.error) {
        console.error('Profile creation error:', result.error);
        const errorMessage = result.error.message || result.error.toString();
        if (errorMessage.includes('duplicate key') || errorMessage.includes('voltmarket_profiles_user_id_key')) {
          console.log('Profile already exists, refreshing...');
          window.location.reload();
        } else {
          alert(`Error creating profile: ${errorMessage}`);
        }
      } else {
        console.log('Profile created successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      alert('An unexpected error occurred while creating your profile. Please try again.');
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
        {/* Email Verification Banner */}
        <EmailVerificationBanner variant="banner" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{profile.company_name ? `, ${profile.company_name}` : ''}!
          </h1>
          <p className="text-gray-600">
            Your GridBazaar {profile.role} dashboard
          </p>
        </div>

        {/* Role-specific dashboard content */}
        {profile.role === 'seller' ? (
          <SellerDashboard profile={profile} />
        ) : (
          <BuyerDashboard profile={profile} />
        )}

        {/* Getting Started Section - Common for both roles */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!profile.is_email_verified && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800">Verify Your Email</h3>
                    <p className="text-sm text-yellow-700 mt-1 mb-3">
                      Check your email and click the verification link to complete your account setup.
                    </p>
                    <ResendVerificationButton />
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
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">
                    {profile.role === 'seller' ? 'Start Selling' : 'Start Buying'}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {profile.role === 'seller' 
                      ? 'Create your first listing to start selling on GridBazaar'
                      : 'Browse available listings to find your next investment'
                    }
                  </p>
                  <Link to={profile.role === 'seller' ? '/voltmarket/create-listing' : '/voltmarket/listings'}>
                    <Button size="sm" className="mt-2">
                      {profile.role === 'seller' ? 'Create Listing' : 'Browse Listings'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};