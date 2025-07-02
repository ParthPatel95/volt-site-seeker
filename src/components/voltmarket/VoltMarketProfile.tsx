
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { User, Building, Phone, Globe, Linkedin, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export const VoltMarketProfile: React.FC = () => {
  const { profile, user, updateProfile, createProfile, loading } = useVoltMarketAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<{
    role: 'buyer' | 'seller' | 'admin';
    seller_type: string;
    company_name: string;
    phone_number: string;
    bio: string;
    website: string;
    linkedin_url: string;
  }>({
    role: (profile?.role as 'buyer' | 'seller' | 'admin') || 'buyer',
    seller_type: profile?.seller_type || '',
    company_name: profile?.company_name || '',
    phone_number: profile?.phone_number || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || ''
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        role: profile.role as 'buyer' | 'seller' | 'admin',
        seller_type: profile.seller_type || '',
        company_name: profile.company_name || '',
        phone_number: profile.phone_number || '',
        bio: profile.bio || '',
        website: profile.website || '',
        linkedin_url: profile.linkedin_url || ''
      });
    }
  }, [profile]);

  const handleCreateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const result = await createProfile(user.id, {
        role: formData.role as 'buyer' | 'seller',
        seller_type: formData.seller_type as any,
        company_name: formData.company_name,
        phone_number: formData.phone_number
      });
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile created successfully!",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      await handleCreateProfile();
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        role: formData.role as 'buyer' | 'seller',
        seller_type: formData.seller_type as any,
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        bio: formData.bio,
        website: formData.website,
        linkedin_url: formData.linkedin_url
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Please sign in to access your profile</h2>
          <Link to="/voltmarket/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your VoltMarket profile and preferences</p>
        </div>

        {!profile && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Profile Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your profile needs to be created. Please fill out the form below and save to create your profile.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'buyer' | 'seller' | 'admin' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === 'seller' && (
                    <div>
                      <Label htmlFor="seller-type">Seller Type</Label>
                      <Select value={formData.seller_type} onValueChange={(value) => setFormData(prev => ({ ...prev, seller_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seller type" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your company and experience..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Type</span>
                  <span className="text-sm font-medium capitalize">{profile?.role || formData.role}</span>
                </div>
                
                {(profile?.seller_type || formData.seller_type) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Seller Type</span>
                    <span className="text-sm font-medium capitalize">
                      {(profile?.seller_type || formData.seller_type).replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <div className="flex items-center gap-1">
                    {profile?.is_email_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${profile?.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {profile?.is_email_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">ID Verified</span>
                  <div className="flex items-center gap-1">
                    {profile?.is_id_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${profile?.is_id_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {profile?.is_id_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                
                {!profile?.is_id_verified && (
                  <Button variant="outline" size="sm" className="w-full">
                    Verify Identity
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
