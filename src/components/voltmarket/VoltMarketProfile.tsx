
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Phone, Mail, Globe, Linkedin, Shield } from 'lucide-react';

export const VoltMarketProfile: React.FC = () => {
  const { profile, updateProfile } = useVoltMarketAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    phone_number: profile?.phone_number || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    seller_type: profile?.seller_type || 'site_owner'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await updateProfile(formData);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      company_name: profile?.company_name || '',
      phone_number: profile?.phone_number || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
      linkedin_url: profile?.linkedin_url || '',
      seller_type: profile?.seller_type || 'site_owner'
    });
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
            <p className="text-gray-600 mt-2">Please sign in to view your profile.</p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {profile.company_name || 'Company Name Not Set'}
                  </h3>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge variant="secondary">{profile.role}</Badge>
                    {profile.seller_type && (
                      <Badge variant="outline">{profile.seller_type.replace('_', ' ')}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email Verified</span>
                    {profile.is_email_verified ? (
                      <Shield className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-red-500">Not Verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">ID Verified</span>
                    {profile.is_id_verified ? (
                      <Shield className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-red-500">Not Verified</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Profile Details
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          company_name: e.target.value 
                        }))}
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          phone_number: e.target.value 
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {profile.role === 'seller' && (
                      <div>
                        <Label htmlFor="seller_type">Seller Type</Label>
                        <Select 
                          value={formData.seller_type} 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            seller_type: value as any 
                          }))}
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

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          bio: e.target.value 
                        }))}
                        placeholder="Tell others about your company and experience..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          website: e.target.value 
                        }))}
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          linkedin_url: e.target.value 
                        }))}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update Profile'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                      <p className="text-gray-900">{profile.company_name || 'Not provided'}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{profile.phone_number || 'Not provided'}</p>
                      </div>
                    </div>

                    {profile.role === 'seller' && profile.seller_type && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Seller Type</Label>
                        <p className="text-gray-900">{profile.seller_type.replace('_', ' ')}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="text-gray-900 whitespace-pre-line">
                        {profile.bio || 'No bio provided'}
                      </p>
                    </div>

                    {profile.website && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Website</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {profile.linkedin_url && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">LinkedIn</Label>
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-gray-400" />
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
