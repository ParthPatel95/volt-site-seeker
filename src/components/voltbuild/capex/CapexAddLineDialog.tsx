import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { CapexCatalogItem } from '../types/voltbuild-advanced.types';

const lineSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  unit_cost: z.coerce.number().min(0, 'Unit cost must be 0 or greater'),
  notes: z.string().optional(),
});

type LineFormValues = z.infer<typeof lineSchema>;

interface CapexAddLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LineFormValues & { catalog_item_id?: string }) => void;
  prefilledItem?: CapexCatalogItem | null;
  isSubmitting?: boolean;
}

export function CapexAddLineDialog({
  open,
  onOpenChange,
  onSubmit,
  prefilledItem,
  isSubmitting,
}: CapexAddLineDialogProps) {
  const form = useForm<LineFormValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      item_name: '',
      quantity: 1,
      unit: 'ea',
      unit_cost: 0,
      notes: '',
    },
  });

  // Reset form when prefilled item changes
  React.useEffect(() => {
    if (prefilledItem) {
      form.reset({
        item_name: prefilledItem.item_name,
        quantity: 1,
        unit: prefilledItem.unit,
        unit_cost: prefilledItem.default_unit_cost,
        notes: '',
      });
    } else if (open) {
      form.reset({
        item_name: '',
        quantity: 1,
        unit: 'ea',
        unit_cost: 0,
        notes: '',
      });
    }
  }, [prefilledItem, open, form]);

  const handleSubmit = (values: LineFormValues) => {
    onSubmit({
      ...values,
      catalog_item_id: prefilledItem?.id,
    });
    form.reset();
    onOpenChange(false);
  };

  const subtotal = (form.watch('quantity') || 0) * (form.watch('unit_cost') || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {prefilledItem ? 'Add Catalog Item' : 'Add Custom Line Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter item name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ea" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Subtotal:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(subtotal)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Line Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
