
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  platformUse: string;
  additionalInfo: string;
}

export function EnhancedSignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    platformUse: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your backend
      console.log('Sign-up form submitted:', formData);
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. Our team will review your application and contact you within 24 hours.",
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
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact our team directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center">Request Platform Access</CardTitle>
        <CardDescription className="text-slate-300 text-center">
          Join accredited investors and industry professionals using VoltScout
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

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Access Request'}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            * Required fields. All information is confidential and used solely for platform access verification.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
