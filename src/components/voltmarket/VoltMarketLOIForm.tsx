
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { FileText, DollarSign, Calendar, User } from 'lucide-react';

const loiSchema = z.object({
  offering_price: z.number().min(1, 'Offering price is required'),
  proposed_terms: z.string().min(10, 'Please provide detailed terms'),
  due_diligence_period_days: z.number().min(1).max(365),
  contingencies: z.string().optional(),
  financing_details: z.string().optional(),
  closing_timeline: z.string().min(1, 'Closing timeline is required'),
  buyer_qualifications: z.string().min(10, 'Please provide buyer qualifications'),
  additional_notes: z.string().optional(),
});

type LOIFormData = z.infer<typeof loiSchema>;

interface VoltMarketLOIFormProps {
  listingId: string;
  listingTitle: string;
  askingPrice: number;
  onSubmit: (data: LOIFormData) => Promise<void>;
  onCancel: () => void;
}

export const VoltMarketLOIForm: React.FC<VoltMarketLOIFormProps> = ({
  listingId,
  listingTitle,
  askingPrice,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LOIFormData>({
    resolver: zodResolver(loiSchema),
    defaultValues: {
      offering_price: askingPrice * 0.9, // Default to 90% of asking price
      proposed_terms: '',
      due_diligence_period_days: 30,
      contingencies: '',
      financing_details: '',
      closing_timeline: '45 days from acceptance',
      buyer_qualifications: '',
      additional_notes: '',
    },
  });

  const handleSubmit = async (data: LOIFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "LOI Submitted",
        description: "Your Letter of Intent has been submitted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit LOI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Letter of Intent
        </CardTitle>
        <p className="text-sm text-gray-600">
          For: <span className="font-semibold">{listingTitle}</span>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="offering_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Offering Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your offer"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_diligence_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Diligence Period (Days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="proposed_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Terms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your proposed terms and conditions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="financing_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financing Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cash purchase, financing arrangements, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Closing Timeline</FormLabel>
                    <FormControl>
                      <Input placeholder="45 days from acceptance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyer_qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Buyer Qualifications
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your experience, financial capacity, and qualifications..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contingencies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contingencies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any contingencies or conditions (financing, inspection, etc.)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information or comments..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit LOI'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
