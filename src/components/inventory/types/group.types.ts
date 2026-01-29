// Inventory Group Types

import { InventoryItem } from './inventory.types';

export interface InventoryGroup {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  group_code: string;
  container_type: 'box' | 'bin' | 'pallet' | 'shelf' | 'drawer';
  location?: string;
  storage_zone?: string;
  bin_number?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryGroupItem {
  id: string;
  group_id: string;
  item_id: string;
  quantity: number;
  added_at: string;
  item?: InventoryItem;
}

export interface InventoryGroupWithItems extends InventoryGroup {
  items: InventoryGroupItem[];
  total_items: number;
  total_value: number;
}

export type ContainerType = InventoryGroup['container_type'];

export const CONTAINER_TYPES: { value: ContainerType; label: string; icon: string }[] = [
  { value: 'box', label: 'Box', icon: 'Package' },
  { value: 'bin', label: 'Bin', icon: 'Archive' },
  { value: 'pallet', label: 'Pallet', icon: 'Layers' },
  { value: 'shelf', label: 'Shelf', icon: 'LayoutGrid' },
  { value: 'drawer', label: 'Drawer', icon: 'Menu' },
];

export type LabelSize = 'small' | 'medium' | 'large';

export interface LabelOptions {
  size: LabelSize;
  showQR: boolean;
  showBarcode: boolean;
  copies: number;
}

export const LABEL_SIZES: { value: LabelSize; label: string; dimensions: string }[] = [
  { value: 'small', label: 'Small', dimensions: '1" × 2"' },
  { value: 'medium', label: 'Medium', dimensions: '2" × 3"' },
  { value: 'large', label: 'Large', dimensions: '4" × 6"' },
];
