import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const hostingInquirySchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(20),
  email: z.string().email('Invalid email address').max(255),
  packageInterest: z.enum(['byom', 'buyhost', 'industrial']),
  numberOfMiners: z.string().optional(),
  expectedPower: z.string().optional(),
  message: z.string().max(1000).optional()
});

type HostingInquiryFormData = z.infer<typeof hostingInquirySchema>;

interface HostingInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: 'byom' | 'buyhost' | 'industrial';
}

export const HostingInquiryForm = ({ isOpen, onClose, selectedPackage = 'byom' }: HostingInquiryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<HostingInquiryFormData>({
    resolver: zodResolver(hostingInquirySchema),
    defaultValues: {
      packageInterest: selectedPackage
    }
  });

  const packageInterest = watch('packageInterest');

  const onSubmit = async (data: HostingInquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Hosting inquiry submitted:', data);
      
      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Our team will contact you within 24 hours to discuss your hosting needs.",
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const packageOptions = [
    { value: 'byom', label: 'Bring Your Own Machine (7.8¢/kWh)' },
    { value: 'buyhost', label: 'Buy & Host (7.5¢/kWh)' },
    { value: 'industrial', label: 'Industrial Clients (7.1¢/kWh)' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-watt-navy">
            Request Hosting Information
          </DialogTitle>
          <DialogDescription>
            Fill out the form below and our team will contact you within 24 hours to discuss your hosting needs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="John Doe"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Mining Company LLC"
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john@miningco.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageInterest">Package Interest *</Label>
            <Select
              value={packageInterest}
              onValueChange={(value) => setValue('packageInterest', value as any)}
            >
              <SelectTrigger className={errors.packageInterest ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.packageInterest && (
              <p className="text-sm text-red-500">{errors.packageInterest.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packageInterest !== 'industrial' && (
              <div className="space-y-2">
                <Label htmlFor="numberOfMiners">Number of Miners</Label>
                <Input
                  id="numberOfMiners"
                  {...register('numberOfMiners')}
                  placeholder="e.g., 100"
                  type="number"
                />
              </div>
            )}

            {packageInterest === 'industrial' && (
              <div className="space-y-2">
                <Label htmlFor="expectedPower">Expected Power Usage</Label>
                <Input
                  id="expectedPower"
                  {...register('expectedPower')}
                  placeholder="e.g., 10MW"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Information</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell us about your hosting requirements, timeline, or any specific questions..."
              rows={4}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
