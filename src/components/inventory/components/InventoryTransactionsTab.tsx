import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  ArrowRightLeft,
  ClipboardCheck,
  Package,
  Loader2,
  History,
} from 'lucide-react';
import { InventoryTransaction, InventoryItem, TransactionType } from '../types/inventory.types';
import { useInventoryTransactions } from '../hooks/useInventoryTransactions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface InventoryTransactionsTabProps {
  workspaceId: string;
  onItemClick: (item: InventoryItem) => void;
}

const TRANSACTION_TYPES: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'count', label: 'Cycle Count' },
];

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'in':
      return <ArrowUpCircle className="w-4 h-4 text-emerald-500" />;
    case 'out':
      return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
    case 'adjustment':
      return <RefreshCw className="w-4 h-4 text-blue-500" />;
    case 'transfer':
      return <ArrowRightLeft className="w-4 h-4 text-purple-500" />;
    case 'count':
      return <ClipboardCheck className="w-4 h-4 text-amber-500" />;
    default:
      return <History className="w-4 h-4" />;
  }
};

const getTransactionLabel = (type: TransactionType) => {
  switch (type) {
    case 'in': return 'Stock In';
    case 'out': return 'Stock Out';
    case 'adjustment': return 'Adjustment';
    case 'transfer': return 'Transfer';
    case 'count': return 'Cycle Count';
    default: return type;
  }
};

export function InventoryTransactionsTab({
  workspaceId,
  onItemClick,
}: InventoryTransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  
  const { workspaceTransactions, isLoadingWorkspace } = useInventoryTransactions(null, workspaceId);

  // Filter transactions
  const filteredTransactions = workspaceTransactions.filter((tx) => {
    // Type filter
    if (typeFilter !== 'all' && tx.transaction_type !== typeFilter) {
      return false;
    }

    // Search filter (by item name, reason, or reference)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesItem = tx.item?.name?.toLowerCase().includes(query);
      const matchesReason = tx.reason?.toLowerCase().includes(query);
      const matchesRef = tx.reference_number?.toLowerCase().includes(query);
      if (!matchesItem && !matchesReason && !matchesRef) {
        return false;
      }
    }

    return true;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = format(new Date(tx.performed_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, InventoryTransaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      {isLoadingWorkspace ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== 'all'
                ? 'No transactions match your filters'
                : 'No transactions yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {groupedTransactions[date].map((tx) => (
                  <Card
                    key={tx.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => tx.item?.id && onItemClick(tx.item as InventoryItem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getTransactionIcon(tx.transaction_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {getTransactionLabel(tx.transaction_type)}
                            </span>
                            <Badge variant="outline" className={cn(
                              tx.quantity_change > 0
                                ? 'text-emerald-600 border-emerald-500/30'
                                : 'text-red-600 border-red-500/30'
                            )}>
                              {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                            </Badge>
                          </div>
                          
                          {tx.item && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                {tx.item.primary_image_url ? (
                                  <img
                                    src={tx.item.primary_image_url}
                                    alt=""
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <Package className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground truncate">
                                {tx.item.name}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{tx.quantity_before} → {tx.quantity_after} {tx.item?.unit || 'units'}</span>
                            {tx.reference_number && (
                              <span>Ref: {tx.reference_number}</span>
                            )}
                            <span>{format(new Date(tx.performed_at), 'h:mm a')}</span>
                          </div>

                          {tx.reason && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {tx.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
