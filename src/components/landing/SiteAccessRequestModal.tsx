
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SiteAccessRequestModalProps {
  children: React.ReactNode;
}

export const SiteAccessRequestModal = ({ children }: SiteAccessRequestModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    powerRequirement: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('site_access_requests')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName,
          power_requirement: formData.powerRequirement,
          location: formData.location
        });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully",
        description: "We'll send you our available sites portfolio within 24 hours.",
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        powerRequirement: '',
        location: ''
      });
      setOpen(false);
    } catch (error) {
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
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            Request Available Sites Portfolio
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="powerRequirement" className="text-foreground">Power Requirement *</Label>
            <Input
              id="powerRequirement"
              value={formData.powerRequirement}
              onChange={(e) => setFormData({ ...formData, powerRequirement: e.target.value })}
              required
              className="bg-muted border-border text-foreground"
              placeholder="e.g., 50MW, 100MW, 500MW+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">Preferred Location *</Label>
            <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
              <SelectTrigger className="bg-muted border-border text-foreground">
                <SelectValue placeholder="Select preferred location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Uganda">Uganda</SelectItem>
              </SelectContent>
            </Select>
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
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
