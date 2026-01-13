import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, ScanBarcode, X, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryFABProps {
  onAdd: () => void;
  onScan: () => void;
}

export function InventoryFAB({ onAdd, onScan }: InventoryFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 pb-safe">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
            isOpen && "rotate-45 bg-muted text-muted-foreground hover:bg-muted"
          )}
          onClick={toggleOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Add Item */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="bg-card px-3 py-1.5 rounded-lg text-sm font-medium shadow-md border">
                Add Item
              </span>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={() => handleAction(onAdd)}
              >
                <Package className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Scan Barcode */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="bg-card px-3 py-1.5 rounded-lg text-sm font-medium shadow-md border">
                Scan Barcode
              </span>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={() => handleAction(onScan)}
              >
                <ScanBarcode className="h-5 w-5" />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
