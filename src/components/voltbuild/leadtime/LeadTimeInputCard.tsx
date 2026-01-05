import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, RefreshCw } from 'lucide-react';
import { LeadTimeProjectInput, JURISDICTIONS, VOLTAGE_LEVELS } from '../types/voltbuild-advanced.types';

const inputSchema = z.object({
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  utility: z.string().optional(),
  requested_mw: z.coerce.number().optional(),
  voltage_level: z.string().optional(),
  interconnection_type: z.enum(['BTM', 'Distribution', 'Transmission']).optional(),
  transformer_required: z.boolean(),
  substation_upgrade_required: z.boolean(),
  permitting_complexity: z.enum(['Low', 'Medium', 'High']).optional(),
  site_type: z.enum(['Greenfield', 'Brownfield', 'Operational']).optional(),
  target_rfs_date: z.string().optional(),
});

type InputFormValues = z.infer<typeof inputSchema>;

interface LeadTimeInputCardProps {
  inputs: LeadTimeProjectInput | null | undefined;
  projectMw: number | null | undefined;
  onSave: (inputs: Partial<LeadTimeProjectInput>) => void;
  onCalculate: () => void;
  isCalculating?: boolean;
  isSaving?: boolean;
}

export function LeadTimeInputCard({
  inputs,
  projectMw,
  onSave,
  onCalculate,
  isCalculating,
  isSaving,
}: LeadTimeInputCardProps) {
  const form = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      jurisdiction: inputs?.jurisdiction || '',
      utility: inputs?.utility || '',
      requested_mw: inputs?.requested_mw || projectMw || undefined,
      voltage_level: inputs?.voltage_level || '',
      interconnection_type: inputs?.interconnection_type || undefined,
      transformer_required: inputs?.transformer_required || false,
      substation_upgrade_required: inputs?.substation_upgrade_required || false,
      permitting_complexity: inputs?.permitting_complexity || undefined,
      site_type: inputs?.site_type || undefined,
      target_rfs_date: inputs?.target_rfs_date || '',
    },
  });

  React.useEffect(() => {
    if (inputs) {
      form.reset({
        jurisdiction: inputs.jurisdiction || '',
        utility: inputs.utility || '',
        requested_mw: inputs.requested_mw || projectMw || undefined,
        voltage_level: inputs.voltage_level || '',
        interconnection_type: inputs.interconnection_type || undefined,
        transformer_required: inputs.transformer_required || false,
        substation_upgrade_required: inputs.substation_upgrade_required || false,
        permitting_complexity: inputs.permitting_complexity || undefined,
        site_type: inputs.site_type || undefined,
        target_rfs_date: inputs.target_rfs_date || '',
      });
    }
  }, [inputs, projectMw, form]);

  const handleSubmit = (values: InputFormValues) => {
    onSave(values as Partial<LeadTimeProjectInput>);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Project Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction / ISO</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JURISDICTIONS.map((j) => (
                          <SelectItem key={j} value={j}>
                            {j}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utility</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter utility name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requested_mw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested MW</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" placeholder="MW" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="voltage_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voltage Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voltage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VOLTAGE_LEVELS.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interconnection_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interconnection Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BTM">Behind-the-Meter (BTM)</SelectItem>
                        <SelectItem value="Distribution">Distribution</SelectItem>
                        <SelectItem value="Transmission">Transmission</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_rfs_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target RFS Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type="date" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="permitting_complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permitting Complexity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="site_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Greenfield">Greenfield</SelectItem>
                        <SelectItem value="Brownfield">Brownfield</SelectItem>
                        <SelectItem value="Operational">Operational</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <FormField
                control={form.control}
                name="transformer_required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Transformer Required
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="substation_upgrade_required"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Substation Upgrade Required
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Inputs'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCalculate}
                disabled={isCalculating || !form.getValues('jurisdiction')}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? 'Calculating...' : 'Calculate Forecast'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
