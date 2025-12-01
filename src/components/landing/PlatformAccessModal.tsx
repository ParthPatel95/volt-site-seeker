
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowRight } from 'lucide-react';

interface PlatformAccessModalProps {
  children: React.ReactNode;
}

export const PlatformAccessModal = ({ children }: PlatformAccessModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    platformUse: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      toast({
        title: "Request Submitted Successfully!",
        description: "Our team will review your application and contact you within 24-48 hours.",
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        role: '',
        platformUse: '',
        additionalInfo: ''
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-watt-navy text-center">
            Request Platform Access
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-watt-navy">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-watt-light border-gray-300 text-watt-navy"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-watt-navy">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-watt-light border-gray-300 text-watt-navy"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-watt-navy">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-watt-light border-gray-300 text-watt-navy"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-watt-navy">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="bg-watt-light border-gray-300 text-watt-navy"
                placeholder="Investment Firm LLC"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-watt-navy">Your Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="bg-watt-light border-gray-300 text-watt-navy"
                placeholder="Managing Partner, CTO, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformUse" className="text-watt-navy">Platform Use Case *</Label>
              <Select value={formData.platformUse} onValueChange={(value) => setFormData({ ...formData, platformUse: value })}>
                <SelectTrigger className="bg-watt-light border-gray-300 text-watt-navy">
                  <SelectValue placeholder="Select your use case" />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="additionalInfo" className="text-watt-navy">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="bg-watt-light border-gray-300 text-watt-navy"
              placeholder="Tell us about your investment goals, AUM, or specific platform needs..."
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Access Request
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-watt-navy/60 text-center">
            * Required fields. All information is confidential and used solely for platform access verification.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
