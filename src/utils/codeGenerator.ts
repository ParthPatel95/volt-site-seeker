// Barcode and QR Code Generation Utilities

/**
 * Generate a unique inventory barcode
 * Format: INV-{timestamp36}-{random4}
 */
export function generateInventoryBarcode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

/**
 * Generate QR code data for an inventory item
 * Contains JSON with item details for quick lookup
 */
export function generateItemQRData(item: {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
}): string {
  return JSON.stringify({
    type: 'inventory_item',
    id: item.id,
    sku: item.sku || undefined,
    name: item.name,
    barcode: item.barcode || undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Generate a unique group code for containers/boxes
 * Format: GRP-{timestamp36}-{random4}
 */
export function generateGroupCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GRP-${timestamp}-${random}`;
}

/**
 * Generate QR code data for an inventory group
 * Contains JSON with group details and item summary
 */
export function generateGroupQRData(group: {
  id: string;
  name: string;
  group_code: string;
  itemCount?: number;
  totalValue?: number;
}): string {
  return JSON.stringify({
    type: 'inventory_group',
    id: group.id,
    name: group.name,
    code: group.group_code,
    itemCount: group.itemCount || 0,
    totalValue: group.totalValue || 0,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Parse QR code data back to object
 */
export function parseQRData(qrData: string): {
  type: 'inventory_item' | 'inventory_group' | 'unknown';
  id?: string;
  [key: string]: any;
} {
  try {
    const data = JSON.parse(qrData);
    if (data.type === 'inventory_item' || data.type === 'inventory_group') {
      return data;
    }
    return { type: 'unknown', raw: qrData };
  } catch {
    return { type: 'unknown', raw: qrData };
  }
}

/**
 * Generate a suggested SKU from item name
 * Format: {category prefix}-{name initials}-{random}
 */
export function generateSuggestedSKU(name: string, category?: string): string {
  // Get category prefix (first 3 chars)
  const categoryPrefix = category 
    ? category.substring(0, 3).toUpperCase() 
    : 'GEN';
  
  // Get name initials or first 3 chars
  const words = name.trim().split(/\s+/);
  const nameCode = words.length >= 2
    ? words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
    : name.substring(0, 3).toUpperCase();
  
  // Random suffix
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${categoryPrefix}-${nameCode}-${random}`;
}
