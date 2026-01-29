import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Camera, Plus, Upload, Loader2, X, Package, Sparkles } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types/inventory.types';
import { InventoryCameraCapture } from './InventoryCameraCapture';
import { InventorySmartCapture } from './InventorySmartCapture';
import { useImageUpload } from '../hooks/useImageUpload';
import { AIAnalysisResult, MultiItemAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { cn } from '@/lib/utils';

interface InventoryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => void;
  onBatchSubmit?: (items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'category'>[]) => void;
  categories: InventoryCategory[];
  workspaceId: string;
  isLoading?: boolean;
  initialBarcode?: string;
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

export function InventoryAddDialog({
  open,
  onOpenChange,
  onSubmit,
  onBatchSubmit,
  categories,
  workspaceId,
  isLoading = false,
  initialBarcode,
}: InventoryAddDialogProps) {
  const isMobile = useIsMobile();
  const [showCamera, setShowCamera] = useState(false);
  const [showSmartCapture, setShowSmartCapture] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: initialBarcode || '',
    category_id: '',
    quantity: 1,
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

  // Sync initialBarcode prop when it changes
  useEffect(() => {
    if (initialBarcode && open) {
      setFormData(prev => ({ ...prev, barcode: initialBarcode }));
    }
  }, [initialBarcode, open]);

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

  const { toast } = useToast();

  // Handle AI analysis results - auto-fill form
  const handleAIResult = async (result: AIAnalysisResult, imageUrl: string) => {
    // Upload the captured image to storage
    const blob = await fetch(imageUrl).then(r => r.blob());
    const uploadResult = await uploadImage(blob, 'items');
    
    // Warn if upload failed
    if (!uploadResult?.url) {
      toast({
        title: 'Image upload failed',
        description: 'Item details were filled but the image could not be saved. You can try uploading again.',
        variant: 'destructive',
      });
    }
    
    // Find matching category
    const matchingCategory = categories.find(
      cat => cat.name.toLowerCase() === result.category.suggested.toLowerCase()
    );

    // Calculate mid-point of market value for unit cost
    const midValue = (result.marketValue.lowEstimate + result.marketValue.highEstimate) / 2;

    // Auto-fill form with AI results
    setFormData(prev => ({
      ...prev,
      name: result.item.name,
      description: result.item.description,
      sku: result.item.suggestedSku || '',
      category_id: matchingCategory?.id || '',
      quantity: result.quantity.count,
      unit: result.quantity.unit,
      unit_cost: Math.round(midValue * 100) / 100,
      condition: result.condition,
      notes: [
        result.item.brand ? `Brand: ${result.item.brand}` : '',
        result.item.model ? `Model: ${result.item.model}` : '',
        result.marketValue.notes || '',
        `AI Confidence: Quantity ${result.quantity.confidence}, Value ${result.marketValue.confidence}`,
      ].filter(Boolean).join('\n'),
      primary_image_url: uploadResult?.url || '',
    }));
  };

  // Handle multi-item AI analysis results - batch add
  const handleMultipleAIResults = async (results: AIAnalysisResult[], imageUrl: string) => {
    if (!onBatchSubmit) {
      toast({
        title: 'Batch add not supported',
        description: 'Please add items one at a time.',
        variant: 'destructive',
      });
      return;
    }

    // Upload the captured image to storage
    const blob = await fetch(imageUrl).then(r => r.blob());
    const uploadResult = await uploadImage(blob, 'items');

    // Convert all AI results to inventory items
    const inventoryItems = results.map(result => {
      // Find matching category
      const matchingCategory = categories.find(
        cat => cat.name.toLowerCase() === result.category.suggested.toLowerCase()
      );

      // Calculate mid-point of market value for unit cost
      const midValue = (result.marketValue.lowEstimate + result.marketValue.highEstimate) / 2;

      return {
        workspace_id: workspaceId,
        name: result.item.name,
        description: result.item.description,
        sku: result.item.suggestedSku || '',
        barcode: '',
        category_id: matchingCategory?.id || undefined,
        quantity: result.quantity.count,
        unit: result.quantity.unit,
        min_stock_level: 0,
        max_stock_level: undefined,
        location: '',
        storage_zone: '',
        bin_number: '',
        unit_cost: Math.round(midValue * 100) / 100,
        supplier_name: '',
        supplier_contact: '',
        purchase_order_ref: '',
        received_date: undefined,
        expiry_date: undefined,
        condition: result.condition as InventoryItem['condition'],
        notes: [
          result.item.brand ? `Brand: ${result.item.brand}` : '',
          result.item.model ? `Model: ${result.item.model}` : '',
          result.marketValue.notes || '',
          `AI Confidence: Quantity ${result.quantity.confidence}, Value ${result.marketValue.confidence}`,
        ].filter(Boolean).join('\n'),
        primary_image_url: uploadResult?.url || '',
        status: result.quantity.count === 0 ? 'out_of_stock' as const : 'in_stock' as const,
        tags: [],
        additional_images: [],
      };
    });

    // Call batch submit
    onBatchSubmit(inventoryItems);
    setShowSmartCapture(false);
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    onSubmit({
      ...formData,
      workspace_id: workspaceId,
      category_id: formData.category_id || undefined,
      max_stock_level: formData.max_stock_level || undefined,
      received_date: formData.received_date || undefined,
      expiry_date: formData.expiry_date || undefined,
      status: formData.quantity === 0 ? 'out_of_stock' : 
              formData.quantity <= formData.min_stock_level ? 'low_stock' : 'in_stock',
      tags: [],
      additional_images: [],
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      barcode: '',
      category_id: '',
      quantity: 1,
      unit: 'units',
      min_stock_level: 0,
      max_stock_level: undefined,
      location: '',
      storage_zone: '',
      bin_number: '',
      unit_cost: 0,
      supplier_name: '',
      supplier_contact: '',
      purchase_order_ref: '',
      received_date: '',
      expiry_date: '',
      condition: 'new',
      notes: '',
      primary_image_url: '',
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={isMobile ? "h-[100dvh] w-full max-w-full rounded-none border-0 p-0" : "sm:max-w-2xl max-h-[90vh] p-0"}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Add Inventory Item
            </DialogTitle>
            <DialogDescription>
              Add a new item to your inventory
            </DialogDescription>
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
                    {/* Smart Scan - Primary Action */}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setShowSmartCapture(true)}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Smart Scan
                    </Button>
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
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter item name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="ABC-123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
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
                  <Label htmlFor="condition">Condition</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Item description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Quantity Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
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
                  <Label htmlFor="min_stock">Min Stock</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    min={0}
                    value={formData.min_stock_level}
                    onChange={(e) => handleChange('min_stock_level', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                  <Input
                    id="unit_cost"
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Warehouse A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_zone">Zone</Label>
                  <Input
                    id="storage_zone"
                    value={formData.storage_zone}
                    onChange={(e) => handleChange('storage_zone', e.target.value)}
                    placeholder="Zone 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bin_number">Bin #</Label>
                  <Input
                    id="bin_number"
                    value={formData.bin_number}
                    onChange={(e) => handleChange('bin_number', e.target.value)}
                    placeholder="A-01-03"
                  />
                </div>
              </div>

              {/* Supplier Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => handleChange('supplier_name', e.target.value)}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_contact">Supplier Contact</Label>
                  <Input
                    id="supplier_contact"
                    value={formData.supplier_contact}
                    onChange={(e) => handleChange('supplier_contact', e.target.value)}
                    placeholder="Email or phone"
                  />
                </div>
              </div>

              {/* Dates Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date</Label>
                  <Input
                    id="received_date"
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => handleChange('received_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
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
                  onClick={handleClose}
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
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

      <InventorySmartCapture
        open={showSmartCapture}
        onOpenChange={setShowSmartCapture}
        onResult={handleAIResult}
        onMultipleResults={handleMultipleAIResults}
        existingCategories={categories.map(c => c.name)}
      />
    </>
  );
}
