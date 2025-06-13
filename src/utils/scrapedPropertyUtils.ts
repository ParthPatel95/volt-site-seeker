
import type { Database } from '@/integrations/supabase/types';

type PropertyType = Database['public']['Enums']['property_type'];

export const formatPrice = (price?: number) => {
  if (!price) return 'Price on Request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getPropertyTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'industrial': return 'bg-blue-500';
    case 'warehouse': return 'bg-green-500';
    case 'manufacturing': return 'bg-orange-500';
    case 'data_center': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const mapPropertyType = (type: string): PropertyType => {
  const typeMap: { [key: string]: PropertyType } = {
    'industrial': 'industrial',
    'warehouse': 'warehouse', 
    'manufacturing': 'manufacturing',
    'data_center': 'data_center',
    'logistics': 'logistics',
    'mixed_use': 'flex_space'
  };
  return typeMap[type.toLowerCase()] || 'other';
};
