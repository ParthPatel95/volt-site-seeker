import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ScanBarcode, 
  Plus,
  Search,
  Folder,
  Bell,
  History,
  Tags
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'no-items' 
  | 'no-results' 
  | 'no-groups' 
  | 'no-alerts' 
  | 'no-transactions'
  | 'no-categories';

interface InventoryEmptyStateProps {
  type: EmptyStateType;
  onAddItem?: () => void;
  onScan?: () => void;
  onCreateGroup?: () => void;
  onCreateCategory?: () => void;
  searchQuery?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}> = {
  'no-items': {
    icon: Package,
    title: 'No items yet',
    description: 'Start building your inventory by adding your first item or scanning a barcode.',
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  'no-groups': {
    icon: Folder,
    title: 'No groups yet',
    description: 'Create groups to organize items by project, location, or any category you need.',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  'no-alerts': {
    icon: Bell,
    title: 'All clear!',
    description: 'You have no stock alerts. All your items are at healthy levels.',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  'no-transactions': {
    icon: History,
    title: 'No activity yet',
    description: 'Transaction history will appear here as you add, remove, or adjust stock.',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  'no-categories': {
    icon: Tags,
    title: 'No categories',
    description: 'Create categories to organize and filter your inventory items.',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
};

export function InventoryEmptyState({
  type,
  onAddItem,
  onScan,
  onCreateGroup,
  onCreateCategory,
  searchQuery,
}: InventoryEmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: 'easeOut' as const
      }
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.1,
        type: 'spring' as const,
        stiffness: 200,
        damping: 20
      }
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
    >
      {/* Animated Icon */}
      <motion.div 
        variants={iconVariants}
        className={cn(
          "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6",
          config.bgColor
        )}
      >
        <Icon className={cn("w-10 h-10 sm:w-12 sm:h-12", config.iconColor)} />
      </motion.div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {type === 'no-results' && searchQuery 
          ? `No results for "${searchQuery}"`
          : config.title
        }
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
        {config.description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {type === 'no-items' && (
          <>
            <Button 
              onClick={onScan} 
              variant="outline"
              className="min-w-[140px] h-11 touch-manipulation"
            >
              <ScanBarcode className="w-4 h-4 mr-2" />
              Scan Barcode
            </Button>
            <Button 
              onClick={onAddItem}
              className="min-w-[140px] h-11 touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </>
        )}

        {type === 'no-results' && (
          <Button 
            onClick={onAddItem}
            variant="outline"
            className="min-w-[140px] h-11 touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        )}

        {type === 'no-groups' && onCreateGroup && (
          <Button 
            onClick={onCreateGroup}
            className="min-w-[140px] h-11 touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}

        {type === 'no-categories' && onCreateCategory && (
          <Button 
            onClick={onCreateCategory}
            className="min-w-[140px] h-11 touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        )}
      </div>
    </motion.div>
  );
}
