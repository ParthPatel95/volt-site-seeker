import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { CapexPhaseLine } from '../types/voltbuild-advanced.types';

interface CapexLineItemTableProps {
  lines: CapexPhaseLine[];
  onUpdate: (id: string, updates: Partial<CapexPhaseLine>) => void;
  onDelete: (id: string) => void;
}

export function CapexLineItemTable({
  lines,
  onUpdate,
  onDelete,
}: CapexLineItemTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    quantity: number;
    unit_cost: number;
  }>({ quantity: 0, unit_cost: 0 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const startEdit = (line: CapexPhaseLine) => {
    setEditingId(line.id);
    setEditValues({
      quantity: line.quantity,
      unit_cost: line.unit_cost,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ quantity: 0, unit_cost: 0 });
  };

  const saveEdit = (id: string) => {
    onUpdate(id, {
      quantity: editValues.quantity,
      unit_cost: editValues.unit_cost,
    });
    setEditingId(null);
  };

  if (lines.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No line items yet. Add from catalog or create custom.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Item</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead className="text-right">Unit Cost</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => {
          const isEditing = editingId === line.id;
          const subtotal = isEditing 
            ? editValues.quantity * editValues.unit_cost 
            : line.subtotal;

          return (
            <TableRow key={line.id}>
              <TableCell>
                <div className="font-medium">{line.item_name}</div>
                {line.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {line.notes}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.quantity}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        quantity: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-20 text-right"
                    step="0.01"
                  />
                ) : (
                  line.quantity.toLocaleString()
                )}
              </TableCell>
              <TableCell>{line.unit}</TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.unit_cost}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        unit_cost: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-24 text-right"
                    step="0.01"
                  />
                ) : (
                  formatCurrency(line.unit_cost)
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(subtotal)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => saveEdit(line.id)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(line)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(line.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
