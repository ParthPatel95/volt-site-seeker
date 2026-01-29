import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowUpDown, 
  Download, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Recycle,
  Package,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { 
  MetalType, 
  WeightUnit, 
  SpreadsheetRow,
  getGradesForMetal,
  DEFAULT_SCRAP_PRICES,
} from '../types/demolition.types';
import { LivePriceIndicator, PriceSourceBadge } from './LivePriceIndicator';
import { useScrapMetalPricing } from '../hooks/useScrapMetalPricing';
import { cn } from '@/lib/utils';
import { AIAnalysisResult } from '../hooks/useInventoryAIAnalysis';

interface ScrapMetalSpreadsheetProps {
  items: AIAnalysisResult[];
  onItemUpdate?: (index: number, updates: Partial<SpreadsheetRow>) => void;
  onItemDelete?: (index: number) => void;
  onExportCSV?: () => void;
  className?: string;
}

type SortField = 'itemName' | 'metalType' | 'weight' | 'pricePerUnit' | 'totalValue';
type SortDirection = 'asc' | 'desc';

const METAL_TYPES: MetalType[] = ['copper', 'aluminum', 'steel', 'brass', 'stainless', 'iron', 'mixed'];

export function ScrapMetalSpreadsheet({
  items,
  onItemUpdate,
  onItemDelete,
  onExportCSV,
  className,
}: ScrapMetalSpreadsheetProps) {
  const { prices, source, lastUpdated, isLoading, refreshPrices, getPriceForMetal } = useScrapMetalPricing();
  
  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<SpreadsheetRow>>({});
  const [includeLaborCosts, setIncludeLaborCosts] = useState(false);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [marginPercent, setMarginPercent] = useState<number>(15);

  // Convert AI results to spreadsheet rows
  const rows: SpreadsheetRow[] = useMemo(() => {
    return items.map((item, index) => {
      const scrap = item.scrapAnalysis;
      const metalType = scrap?.metalType || 'mixed';
      const grade = scrap?.metalGrade || 'Mixed';
      const weight = scrap?.estimatedWeight?.value || 0;
      const weightUnit = scrap?.estimatedWeight?.unit || 'lbs';
      const pricePerUnit = scrap?.scrapValue?.pricePerUnit || getPriceForMetal(metalType, grade);
      const totalValue = weight * pricePerUnit;
      
      return {
        id: `row-${index}`,
        itemName: item.item.name,
        metalType,
        grade,
        weight,
        weightUnit,
        pricePerUnit,
        totalValue,
        isSalvage: item.salvageAssessment?.recommendedDisposition === 'resell',
        confidence: scrap?.estimatedWeight?.confidence || 'medium',
        isEditing: false,
      };
    });
  }, [items, getPriceForMetal]);

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'itemName':
          comparison = a.itemName.localeCompare(b.itemName);
          break;
        case 'metalType':
          comparison = a.metalType.localeCompare(b.metalType);
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'pricePerUnit':
          comparison = a.pricePerUnit - b.pricePerUnit;
          break;
        case 'totalValue':
          comparison = a.totalValue - b.totalValue;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rows, sortField, sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    const scrapTotal = sortedRows
      .filter(r => !r.isSalvage)
      .reduce((sum, r) => sum + r.totalValue, 0);
    const salvageTotal = sortedRows
      .filter(r => r.isSalvage)
      .reduce((sum, r) => sum + r.totalValue, 0);
    const totalWeight = sortedRows.reduce((sum, r) => sum + r.weight, 0);
    const grandTotal = scrapTotal + salvageTotal;
    const withLabor = includeLaborCosts ? grandTotal - laborCost : grandTotal;
    const withMargin = withLabor * (1 + marginPercent / 100);
    
    return {
      scrapTotal,
      salvageTotal,
      totalWeight,
      grandTotal,
      withLabor,
      withMargin,
    };
  }, [sortedRows, includeLaborCosts, laborCost, marginPercent]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Start editing
  const startEdit = (index: number, row: SpreadsheetRow) => {
    setEditingRow(index);
    setEditValues({
      weight: row.weight,
      metalType: row.metalType,
      grade: row.grade,
      pricePerUnit: row.pricePerUnit,
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingRow(null);
    setEditValues({});
  };

  // Save edit
  const saveEdit = (index: number) => {
    if (onItemUpdate && editValues) {
      // Recalculate total value
      const weight = editValues.weight || 0;
      const pricePerUnit = editValues.pricePerUnit || 0;
      onItemUpdate(index, {
        ...editValues,
        totalValue: weight * pricePerUnit,
        isEditing: false,
      });
    }
    setEditingRow(null);
    setEditValues({});
  };

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Item', 'Metal Type', 'Grade', 'Weight (lbs)', 'Price/lb', 'Total Value', 'Type'];
    const csvRows = sortedRows.map(row => [
      `"${row.itemName}"`,
      row.metalType,
      row.grade,
      row.weight.toFixed(1),
      `$${row.pricePerUnit.toFixed(2)}`,
      `$${row.totalValue.toFixed(2)}`,
      row.isSalvage ? 'Salvage' : 'Scrap',
    ]);
    
    // Add totals
    csvRows.push([]);
    csvRows.push(['', '', '', totals.totalWeight.toFixed(1), '', `$${totals.grandTotal.toFixed(2)}`, 'TOTAL']);
    
    const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrap-metal-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedRows, totals]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={cn(
        "w-3.5 h-3.5 ml-1",
        sortField === field && "text-primary"
      )} />
    </Button>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Scrap Metal Breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <LivePriceIndicator 
              source={source} 
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={refreshPrices}
              compact
            />
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-0">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[200px]">
                  <SortButton field="itemName">Item</SortButton>
                </TableHead>
                <TableHead className="w-[100px]">
                  <SortButton field="metalType">Metal</SortButton>
                </TableHead>
                <TableHead className="w-[120px]">Grade</TableHead>
                <TableHead className="w-[100px] text-right">
                  <SortButton field="weight">Weight</SortButton>
                </TableHead>
                <TableHead className="w-[90px] text-right">
                  <SortButton field="pricePerUnit">$/lb</SortButton>
                </TableHead>
                <TableHead className="w-[100px] text-right">
                  <SortButton field="totalValue">Value</SortButton>
                </TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedRows.map((row, index) => (
                <TableRow 
                  key={row.id}
                  className={cn(
                    editingRow === index && "bg-muted/50"
                  )}
                >
                  {/* Item Name */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[180px]">{row.itemName}</span>
                      {row.confidence === 'low' && (
                        <Badge variant="outline" className="text-[9px] text-yellow-600">
                          Low confidence
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Metal Type */}
                  <TableCell>
                    {editingRow === index ? (
                      <Select 
                        value={editValues.metalType} 
                        onValueChange={(v) => setEditValues(prev => ({ ...prev, metalType: v as MetalType }))}
                      >
                        <SelectTrigger className="h-7 w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METAL_TYPES.map(type => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {row.metalType}
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* Grade */}
                  <TableCell>
                    {editingRow === index ? (
                      <Select 
                        value={editValues.grade}
                        onValueChange={(v) => setEditValues(prev => ({ ...prev, grade: v }))}
                      >
                        <SelectTrigger className="h-7 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getGradesForMetal(editValues.metalType as MetalType || row.metalType).map(grade => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{row.grade}</span>
                    )}
                  </TableCell>
                  
                  {/* Weight */}
                  <TableCell className="text-right">
                    {editingRow === index ? (
                      <Input
                        type="number"
                        value={editValues.weight}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          weight: parseFloat(e.target.value) || 0 
                        }))}
                        className="h-7 w-[70px] text-right"
                      />
                    ) : (
                      <span>{row.weight.toLocaleString(undefined, { maximumFractionDigits: 1 })} lbs</span>
                    )}
                  </TableCell>
                  
                  {/* Price per Unit */}
                  <TableCell className="text-right">
                    {editingRow === index ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.pricePerUnit}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          pricePerUnit: parseFloat(e.target.value) || 0 
                        }))}
                        className="h-7 w-[60px] text-right"
                      />
                    ) : (
                      <span>${row.pricePerUnit.toFixed(2)}</span>
                    )}
                  </TableCell>
                  
                  {/* Total Value */}
                  <TableCell className="text-right font-medium">
                    ${(editingRow === index 
                      ? (editValues.weight || 0) * (editValues.pricePerUnit || 0)
                      : row.totalValue
                    ).toFixed(2)}
                  </TableCell>
                  
                  {/* Type Badge */}
                  <TableCell>
                    {row.isSalvage ? (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                        <Package className="w-3 h-3 mr-1" />
                        Salvage
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                        <Recycle className="w-3 h-3 mr-1" />
                        Scrap
                      </Badge>
                    )}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    {editingRow === index ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-green-600"
                          onClick={() => saveEdit(index)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => startEdit(index, row)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {onItemDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => onItemDelete(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter className="sticky bottom-0 bg-muted/80 backdrop-blur">
              <TableRow>
                <TableCell colSpan={3} className="font-medium">
                  TOTALS
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totals.totalWeight.toLocaleString(undefined, { maximumFractionDigits: 0 })} lbs
                </TableCell>
                <TableCell />
                <TableCell className="text-right font-bold text-primary">
                  ${totals.grandTotal.toFixed(2)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>

        {/* Summary & Quote Controls */}
        <div className="p-4 space-y-4 border-t">
          {/* Subtotals */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-950/30">
              <span className="flex items-center gap-1.5">
                <Recycle className="w-4 h-4 text-amber-600" />
                Scrap Value:
              </span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                ${totals.scrapTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950/30">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-green-600" />
                Salvage Value:
              </span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                ${totals.salvageTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Quote Calculator */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="labor" 
                checked={includeLaborCosts}
                onCheckedChange={(c) => setIncludeLaborCosts(!!c)}
              />
              <label htmlFor="labor" className="text-sm cursor-pointer">
                Include labor costs
              </label>
              {includeLaborCosts && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    className="h-7 w-20"
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Margin:</span>
              <Input
                type="number"
                value={marginPercent}
                onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                className="h-7 w-16"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Final Quote Amount */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <span className="font-semibold">Quoted Amount:</span>
            <span className="text-2xl font-bold text-primary">
              ${totals.withMargin.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
