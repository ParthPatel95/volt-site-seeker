import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'in' | 'out';
  itemName: string;
  currentQuantity: number;
  unit: string;
  onSubmit: (quantity: number, reason?: string) => void;
  isLoading?: boolean;
}

export function InventoryAdjustDialog({
  open,
  onOpenChange,
  type,
  itemName,
  currentQuantity,
  unit,
  onSubmit,
  isLoading = false,
}: InventoryAdjustDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  const isAddStock = type === 'in';
  const newQuantity = isAddStock 
    ? currentQuantity + quantity 
    : Math.max(0, currentQuantity - quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    
    const adjustedQuantity = isAddStock ? quantity : -quantity;
    onSubmit(adjustedQuantity, reason || undefined);
    
    // Reset form
    setQuantity(1);
    setReason('');
  };

  const handleClose = () => {
    setQuantity(1);
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAddStock ? (
              <Plus className="w-5 h-5 text-emerald-500" />
            ) : (
              <Minus className="w-5 h-5 text-red-500" />
            )}
            {isAddStock ? 'Add Stock' : 'Remove Stock'}
          </DialogTitle>
          <DialogDescription>
            {itemName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Stock */}
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className="text-2xl font-bold">{currentQuantity} <span className="text-sm font-normal">{unit}</span></p>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to {isAddStock ? 'add' : 'remove'}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={!isAddStock ? currentQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center text-lg font-medium"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!isAddStock && quantity >= currentQuantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* New Quantity Preview */}
          <div className={cn(
            "p-3 rounded-lg text-center",
            isAddStock ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}>
            <p className="text-sm text-muted-foreground">New Stock Level</p>
            <p className={cn(
              "text-2xl font-bold",
              isAddStock ? "text-emerald-600" : "text-amber-600"
            )}>
              {newQuantity} <span className="text-sm font-normal">{unit}</span>
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isAddStock ? "e.g., New shipment received" : "e.g., Used for project"}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1",
                isAddStock 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-amber-600 hover:bg-amber-700"
              )}
              disabled={quantity <= 0 || (!isAddStock && quantity > currentQuantity) || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isAddStock ? (
                <Plus className="w-4 h-4 mr-2" />
              ) : (
                <Minus className="w-4 h-4 mr-2" />
              )}
              {isAddStock ? 'Add' : 'Remove'} {quantity} {unit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
