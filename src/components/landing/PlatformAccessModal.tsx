
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
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Request Platform Access
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-200">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-200">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Investment Firm LLC"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-200">Your Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Managing Partner, CTO, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformUse" className="text-slate-200">Platform Use Case *</Label>
              <Select value={formData.platformUse} onValueChange={(value) => setFormData({ ...formData, platformUse: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select your use case" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="investor" className="text-white hover:bg-slate-700">Investor - Fund LP/Co-Investment</SelectItem>
                  <SelectItem value="energy-broker" className="text-white hover:bg-slate-700">Energy Broker - Site Sourcing</SelectItem>
                  <SelectItem value="middleman" className="text-white hover:bg-slate-700">Middleman - Deal Flow</SelectItem>
                  <SelectItem value="data-center-operator" className="text-white hover:bg-slate-700">Data Center Operator - Site Selection</SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-slate-700">Other - Please specify below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-slate-200">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Tell us about your investment goals, AUM, or specific platform needs..."
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-electric-blue text-white font-semibold py-3"
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

          <p className="text-xs text-slate-400 text-center">
            * Required fields. All information is confidential and used solely for platform access verification.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
