import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Name is required').max(100),
  company: z.string().trim().min(2, 'Company is required').max(100),
  role: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  client_type: z.enum(['ai_hpc', 'bitcoin', 'inference', 'other']),
  target_capacity_mw: z.string().trim().max(20).optional().or(z.literal('')),
  target_geography: z.string().trim().max(150).optional().or(z.literal('')),
  timeline: z.string().trim().max(80).optional().or(z.literal('')),
  project_description: z.string().trim().max(2000).optional().or(z.literal('')),
  // honeypot
  website: z.string().max(0).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const clientTypes = [
  { value: 'ai_hpc',    label: 'AI / HPC' },
  { value: 'bitcoin',   label: 'Bitcoin Mining' },
  { value: 'inference', label: 'Inference / Training' },
  { value: 'other',     label: 'Other' },
] as const;

export const AdvisoryInquiryForm = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const mountedAt = useRef(Date.now());
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { client_type: 'ai_hpc' },
  });

  const selectedType = watch('client_type');

  const onSubmit = async (data: FormData) => {
    // Bot guard: minimum 3s on the page
    if (Date.now() - mountedAt.current < 3000) {
      toast({ title: 'Please review your details', description: 'Take a moment to confirm your information.', variant: 'destructive' });
      return;
    }
    if (data.website) return; // honeypot tripped

    setSubmitting(true);
    try {
      const { error } = await supabase.from('consulting_inquiries').insert({
        full_name: data.full_name,
        company: data.company,
        role: data.role || null,
        email: data.email,
        phone: data.phone || null,
        client_type: data.client_type,
        target_capacity_mw: data.target_capacity_mw ? Number(data.target_capacity_mw) || null : null,
        target_geography: data.target_geography || null,
        timeline: data.timeline || null,
        project_description: data.project_description || null,
        source: 'advisory_page',
      });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Inquiry received', description: 'Our advisory team will reach out within one business day.' });
    } catch (e: any) {
      toast({ title: 'Submission failed', description: e?.message ?? 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-3xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Start a conversation</h2>
            <p className="text-lg text-muted-foreground">Tell us about your project. We'll respond within one business day.</p>
          </div>
        </ScrollReveal>

        {success ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-watt-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Inquiry received</h3>
            <p className="text-muted-foreground">Thanks — our advisory team will review your request and reach out within one business day.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
            {/* honeypot */}
            <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} className="absolute -left-[9999px] w-0 h-0" aria-hidden />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" {...register('full_name')} placeholder="Jane Doe" />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" {...register('company')} placeholder="Acme AI" />
                {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / title</Label>
                <Input id="role" {...register('role')} placeholder="VP Infrastructure" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email *</Label>
                <Input id="email" type="email" {...register('email')} placeholder="jane@acme.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} placeholder="+1 555 555 0123" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {clientTypes.map(t => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setValue('client_type', t.value, { shouldValidate: true })}
                    className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-all ${
                      selectedType === t.value
                        ? 'bg-watt-bitcoin text-white border-watt-bitcoin'
                        : 'bg-background border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="target_capacity_mw">Target capacity (MW)</Label>
                <Input id="target_capacity_mw" type="number" min="0" {...register('target_capacity_mw')} placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_geography">Target geography</Label>
                <Input id="target_geography" {...register('target_geography')} placeholder="Alberta, Texas..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Energization timeline</Label>
                <select id="timeline" {...register('timeline')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select…</option>
                  <option value="<6 months">Under 6 months</option>
                  <option value="6-12 months">6–12 months</option>
                  <option value="12-24 months">12–24 months</option>
                  <option value="24+ months">24+ months</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_description">Project description</Label>
              <Textarea id="project_description" rows={5} maxLength={2000} {...register('project_description')} placeholder="Tell us about the workload, constraints, and what success looks like." />
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit inquiry'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">We typically respond within one business day.</p>
          </form>
        )}
      </div>
    </section>
  );
});
AdvisoryInquiryForm.displayName = 'AdvisoryInquiryForm';
