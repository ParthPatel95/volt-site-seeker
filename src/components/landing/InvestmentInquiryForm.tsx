import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const investmentInquirySchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  companyName: z.string()
    .trim()
    .min(2, { message: "Company name must be at least 2 characters" })
    .max(100, { message: "Company name must be less than 100 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Please enter a valid phone number" })
    .max(20, { message: "Phone number must be less than 20 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  investmentAmount: z.string()
    .trim()
    .min(1, { message: "Please enter your desired investment amount" })
    .max(50, { message: "Investment amount must be less than 50 characters" }),
  message: z.string()
    .trim()
    .max(1000, { message: "Message must be less than 1000 characters" })
    .optional(),
});

type InvestmentInquiryFormData = z.infer<typeof investmentInquirySchema>;

interface InvestmentInquiryFormProps {
  onSuccess?: () => void;
}

export const InvestmentInquiryForm = ({ onSuccess }: InvestmentInquiryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvestmentInquiryFormData>({
    resolver: zodResolver(investmentInquirySchema),
  });

  const onSubmit = async (data: InvestmentInquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Integrate with backend/email service
      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Investment inquiry submitted:', data);
      
      toast({
        title: "Inquiry Submitted Successfully",
        description: "We'll contact you shortly to discuss your investment opportunity.",
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact investors@wattbyte.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground font-medium">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder="John Doe"
          className="border-border focus:border-watt-trust focus:ring-watt-trust"
          disabled={isSubmitting}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-foreground font-medium">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="companyName"
          {...register('companyName')}
          placeholder="Acme Investments LLC"
          className="border-border focus:border-watt-trust focus:ring-watt-trust"
          disabled={isSubmitting}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-medium">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 123-4567"
            className="border-border focus:border-watt-trust focus:ring-watt-trust"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            className="border-border focus:border-watt-trust focus:ring-watt-trust"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentAmount" className="text-foreground font-medium">
          Investment Amount <span className="text-destructive">*</span>
        </Label>
        <Input
          id="investmentAmount"
          {...register('investmentAmount')}
          placeholder="e.g., $500,000 - $1,000,000"
          className="border-border focus:border-watt-trust focus:ring-watt-trust"
          disabled={isSubmitting}
        />
        {errors.investmentAmount && (
          <p className="text-sm text-destructive">{errors.investmentAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground font-medium">
          Additional Message (Optional)
        </Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Tell us more about your investment interests..."
          rows={4}
          className="border-border focus:border-watt-trust focus:ring-watt-trust resize-none"
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold py-6 text-lg transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Investment Inquiry'
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By submitting this form, you agree to be contacted by WattByte regarding investment opportunities.
      </p>
    </form>
  );
};
