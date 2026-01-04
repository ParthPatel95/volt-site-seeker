
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoltMarketProfileImageUpload } from './VoltMarketProfileImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Globe, Linkedin } from 'lucide-react';

export const VoltMarketProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    company_name: '',
    phone_number: '',
    profile_image_url: '',
    bio: '',
    website: '',
    linkedin_url: '',
    role: 'buyer' as 'buyer' | 'seller',
    seller_type: 'site_owner' as 'site_owner' | 'broker' | 'realtor' | 'equipment_vendor'
  });

  const { profile, user } = useVoltMarketAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setProfileData({
        company_name: profile.company_name || '',
        phone_number: profile.phone_number || '',
        profile_image_url: profile.profile_image_url || '',
        bio: profile.bio || '',
        website: profile.website || '',
        linkedin_url: profile.linkedin_url || '',
        role: profile.role === 'admin' ? 'buyer' : profile.role, // Convert admin to buyer as fallback
        seller_type: profile.seller_type || 'site_owner'
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('voltmarket_profiles')
        .update(profileData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, profile_image_url: imageUrl }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your account information and preferences</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Profile Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoltMarketProfileImageUpload
                  currentImageUrl={profileData.profile_image_url}
                  onImageChange={handleImageChange}
                  userName={profileData.company_name || user?.email || 'User'}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Select 
                      value={profileData.role} 
                      onValueChange={(value: 'buyer' | 'seller') => 
                        setProfileData(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {profileData.role === 'seller' && (
                    <div>
                      <Label htmlFor="seller_type">Seller Type</Label>
                      <Select 
                        value={profileData.seller_type} 
                        onValueChange={(value: any) => 
                          setProfileData(prev => ({ ...prev, seller_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="site_owner">Site Owner</SelectItem>
                          <SelectItem value="broker">Broker</SelectItem>
                          <SelectItem value="realtor">Realtor</SelectItem>
                          <SelectItem value="equipment_vendor">Equipment Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about your company and experience..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
