// Inventory Types for Standalone Inventory Module

export interface InventoryWorkspace {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  workspace_id: string;
  
  // Item identification
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  qr_code?: string;
  
  // Categorization
  category_id?: string;
  category?: InventoryCategory;
  tags?: string[];
  
  // Quantity tracking
  quantity: number;
  unit: string;
  min_stock_level: number;
  max_stock_level?: number;
  
  // Location
  location?: string;
  storage_zone?: string;
  bin_number?: string;
  
  // Financial
  unit_cost: number;
  
  // Supplier info
  supplier_name?: string;
  supplier_contact?: string;
  purchase_order_ref?: string;
  
  // Dates
  received_date?: string;
  expiry_date?: string;
  last_counted_date?: string;
  
  // Images
  primary_image_url?: string;
  additional_images?: string[];
  
  // Metadata
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued';
  notes?: string;
  
  // Audit
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'in' | 'out' | 'adjustment' | 'transfer' | 'count';

export interface InventoryTransaction {
  id: string;
  item_id: string;
  workspace_id: string;
  
  transaction_type: TransactionType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  
  // Context
  reason?: string;
  reference_number?: string;
  related_task_id?: string;
  destination_location?: string;
  
  // Audit
  performed_by?: string;
  performed_at: string;
  notes?: string;
  
  // Joined data
  item?: Partial<InventoryItem>;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  categoryCounts: Record<string, number>;
}

export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  status?: InventoryItem['status'];
  location?: string;
  lowStockOnly?: boolean;
  expiringOnly?: boolean;
}

// AI Analysis Types
export interface AIAnalysisResult {
  item: {
    name: string;
    description: string;
    brand?: string;
    model?: string;
    suggestedSku?: string;
  };
  quantity: {
    count: number;
    unit: string;
    confidence: 'high' | 'medium' | 'low';
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  category: {
    suggested: string;
    alternatives: string[];
  };
  marketValue: {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
    notes?: string;
    isUsed: boolean;
  };
}
