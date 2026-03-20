import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle, RotateCcw, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderingItem {
  id: string;
  label: string;
  description?: string;
}

interface OrderingExerciseProps {
  title: string;
  instruction: string;
  items: OrderingItem[]; // in correct order
  className?: string;
}

export const OrderingExercise: React.FC<OrderingExerciseProps> = ({
  title,
  instruction,
  items,
  className,
}) => {
  const [shuffledItems, setShuffledItems] = useState<OrderingItem[]>(() => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [checked, setChecked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    if (checked) return;
    
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      // Swap
      const newItems = [...shuffledItems];
      [newItems[selectedIndex], newItems[index]] = [newItems[index], newItems[selectedIndex]];
      setShuffledItems(newItems);
      setSelectedIndex(null);
    }
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (checked) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= shuffledItems.length) return;
    const newItems = [...shuffledItems];
    [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
    setShuffledItems(newItems);
  };

  const handleCheck = () => setChecked(true);

  const handleReset = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledItems(shuffled);
    setChecked(false);
    setSelectedIndex(null);
  };

  const isCorrect = (index: number) => shuffledItems[index].id === items[index].id;
  const allCorrect = shuffledItems.every((item, i) => item.id === items[i].id);
  const score = shuffledItems.filter((item, i) => item.id === items[i].id).length;

  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 md:p-8', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-primary" />
          {title}
        </h3>
        {checked && (
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6">{instruction}</p>

      <div className="space-y-2 mb-6">
        {shuffledItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => handleItemClick(index)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              checked
                ? isCorrect(index)
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-red-500/10 border-red-500/40'
                : selectedIndex === index
                  ? 'bg-primary/10 border-primary cursor-pointer'
                  : 'bg-background border-border hover:border-primary/40 cursor-pointer'
            )}
          >
            <div className="flex items-center gap-2 shrink-0">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                checked
                  ? isCorrect(index)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-400 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm">{item.label}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground">{item.description}</div>
              )}
            </div>
            {checked && (
              isCorrect(index) 
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            {!checked && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(index, 'up'); }}
                  disabled={index === 0}
                  className="px-1 py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveItem(index, 'down'); }}
                  disabled={index === shuffledItems.length - 1}
                  className="px-1 py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!checked ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Click two items to swap, or use arrows to reorder</p>
          <button
            onClick={handleCheck}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Check Order
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'p-4 rounded-lg border text-center',
            allCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
          )}
        >
          <p className="font-semibold text-foreground">
            {allCorrect ? '🎉 Perfect order!' : `${score}/${items.length} correct`}
          </p>
          {!allCorrect && (
            <p className="text-sm text-muted-foreground mt-1">
              Items highlighted in red are in the wrong position. Try again!
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrderingExercise;
