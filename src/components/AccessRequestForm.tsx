
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AccessRequestFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platformUse: string;
  additionalInfo: string;
}

export function AccessRequestForm() {
  const [formData, setFormData] = useState<AccessRequestFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    platformUse: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof AccessRequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('submit-access-request', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit access request');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to submit access request');
      }

      setIsSubmitted(true);
      toast({
        title: "Request Submitted!",
        description: "Thank you for your interest. Our team will review your application and contact you within 24-48 hours.",
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        platformUse: '',
        additionalInfo: ''
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact our team directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Request Submitted Successfully!</h3>
            <p className="text-slate-300 mb-4">
              Thank you for your interest in WattByte. Our team will review your application and contact you within 24-48 hours.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline" 
              className="border-slate-500 text-white hover:bg-slate-800"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center">Request Platform Access</CardTitle>
        <CardDescription className="text-slate-300 text-center">
          Submit your application for access to WattByte's VoltScout platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Full Name *</Label>
              <Input 
                className="bg-slate-700/50 border-slate-600 text-white" 
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Email Address *</Label>
              <Input 
                type="email"
                className="bg-slate-700/50 border-slate-600 text-white" 
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Phone Number *</Label>
              <Input 
                type="tel"
                className="bg-slate-700/50 border-slate-600 text-white" 
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Company Name *</Label>
              <Input 
                className="bg-slate-700/50 border-slate-600 text-white" 
                placeholder="Investment Firm LLC"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Your Role *</Label>
              <Input 
                className="bg-slate-700/50 border-slate-600 text-white" 
                placeholder="Managing Partner, CTO, etc."
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Platform Use Case *</Label>
              <Select onValueChange={(value) => handleInputChange('platformUse', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select your use case" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="investor">Investor - Fund LP/Co-Investment</SelectItem>
                  <SelectItem value="energy-broker">Energy Broker - Site Sourcing</SelectItem>
                  <SelectItem value="middleman">Middleman - Deal Flow</SelectItem>
                  <SelectItem value="data-center-operator">Data Center Operator - Site Selection</SelectItem>
                  <SelectItem value="other">Other - Please specify below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-200">Additional Information</Label>
            <Textarea 
              className="bg-slate-700/50 border-slate-600 text-white" 
              placeholder="Tell us about your investment goals, AUM, or specific platform needs..."
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Access Request'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            * Required fields. All information is confidential and used solely for platform access verification.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
