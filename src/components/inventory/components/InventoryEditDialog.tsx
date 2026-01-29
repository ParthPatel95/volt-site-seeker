import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Upload, Loader2, X, Save, Package } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types/inventory.types';
import { InventoryCameraCapture } from './InventoryCameraCapture';
import { useImageUpload } from '../hooks/useImageUpload';

interface InventoryEditDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (updates: Partial<InventoryItem>) => void;
  categories: InventoryCategory[];
  isLoading?: boolean;
}

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const UNITS = [
  'units', 'pieces', 'boxes', 'kg', 'lbs', 'meters', 'feet', 'rolls', 'sets', 'pairs'
];

export function InventoryEditDialog({
  item,
  open,
  onOpenChange,
  onSubmit,
  categories,
  isLoading = false,
}: InventoryEditDialogProps) {
  const [showCamera, setShowCamera] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category_id: '',
    unit: 'units',
    min_stock_level: 0,
    max_stock_level: undefined as number | undefined,
    location: '',
    storage_zone: '',
    bin_number: '',
    unit_cost: 0,
    supplier_name: '',
    supplier_contact: '',
    purchase_order_ref: '',
    received_date: '',
    expiry_date: '',
    condition: 'new' as InventoryItem['condition'],
    notes: '',
    primary_image_url: '',
  });

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        category_id: item.category_id || '',
        unit: item.unit || 'units',
        min_stock_level: item.min_stock_level || 0,
        max_stock_level: item.max_stock_level,
        location: item.location || '',
        storage_zone: item.storage_zone || '',
        bin_number: item.bin_number || '',
        unit_cost: item.unit_cost || 0,
        supplier_name: item.supplier_name || '',
        supplier_contact: item.supplier_contact || '',
        purchase_order_ref: item.purchase_order_ref || '',
        received_date: item.received_date || '',
        expiry_date: item.expiry_date || '',
        condition: item.condition || 'new',
        notes: item.notes || '',
        primary_image_url: item.primary_image_url || '',
      });
    }
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageCapture = (imageUrl: string) => {
    handleChange('primary_image_url', imageUrl);
    setShowCamera(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file, 'items');
    if (result) {
      handleChange('primary_image_url', result.url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    onSubmit({
      ...formData,
      category_id: formData.category_id || undefined,
      max_stock_level: formData.max_stock_level || undefined,
      received_date: formData.received_date || undefined,
      expiry_date: formData.expiry_date || undefined,
    });
  };

  if (!item) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Edit Item
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
              {/* Image Section */}
              <div className="space-y-2">
                <Label>Item Photo</Label>
                <div className="flex items-center gap-4">
                  {formData.primary_image_url ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <img
                        src={formData.primary_image_url}
                        alt="Item"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('primary_image_url', '')}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCamera(true)}
                      disabled={isUploading}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={isUploading}
                      >
                        <span>
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-name">Item Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter item name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="ABC-123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-barcode">Barcode</Label>
                  <Input
                    id="edit-barcode"
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => handleChange('category_id', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) => handleChange('condition', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Item description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Stock Settings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) => handleChange('unit', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-min-stock">Min Stock</Label>
                  <Input
                    id="edit-min-stock"
                    type="number"
                    min={0}
                    value={formData.min_stock_level}
                    onChange={(e) => handleChange('min_stock_level', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-max-stock">Max Stock</Label>
                  <Input
                    id="edit-max-stock"
                    type="number"
                    min={0}
                    value={formData.max_stock_level || ''}
                    onChange={(e) => handleChange('max_stock_level', parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-unit-cost">Unit Cost ($)</Label>
                  <Input
                    id="edit-unit-cost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.unit_cost}
                    onChange={(e) => handleChange('unit_cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Warehouse A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-zone">Zone</Label>
                  <Input
                    id="edit-zone"
                    value={formData.storage_zone}
                    onChange={(e) => handleChange('storage_zone', e.target.value)}
                    placeholder="Zone 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bin">Bin #</Label>
                  <Input
                    id="edit-bin"
                    value={formData.bin_number}
                    onChange={(e) => handleChange('bin_number', e.target.value)}
                    placeholder="A-01-03"
                  />
                </div>
              </div>

              {/* Supplier Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Input
                    id="edit-supplier"
                    value={formData.supplier_name}
                    onChange={(e) => handleChange('supplier_name', e.target.value)}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-supplier-contact">Supplier Contact</Label>
                  <Input
                    id="edit-supplier-contact"
                    value={formData.supplier_contact}
                    onChange={(e) => handleChange('supplier_contact', e.target.value)}
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-received">Received Date</Label>
                  <Input
                    id="edit-received"
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => handleChange('received_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expiry">Expiry Date</Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!formData.name.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <InventoryCameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleImageCapture}
        folder="items"
      />
    </>
  );
}
