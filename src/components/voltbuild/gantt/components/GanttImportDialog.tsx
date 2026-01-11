import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseCSVContent, generateImportTemplate, downloadCSV, ParsedTaskData } from '../utils/exportUtils';

interface GanttImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ParsedTaskData[]) => Promise<void>;
}

export function GanttImportDialog({
  open,
  onOpenChange,
  onImport,
}: GanttImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const extension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension)) {
        throw new Error('Please upload a CSV or Excel file');
      }

      // Read file content
      if (extension === '.csv' || selectedFile.type === 'text/csv') {
        const text = await selectedFile.text();
        const parsed = parseCSVContent(text);

        if (parsed.length === 0) {
          throw new Error('No valid data found in the file. Please check the format.');
        }

        setFile(selectedFile);
        setParsedData(parsed);
      } else {
        // For Excel files, we'd need a library like xlsx
        // For now, show a message to convert to CSV
        throw new Error('Excel files are not yet supported. Please export your spreadsheet as CSV.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setParsedData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(parsedData);
      toast.success(`Successfully imported ${parsedData.length} items`);
      handleReset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateImportTemplate();
    downloadCSV(template, 'gantt_import_template.csv');
    toast.success('Template downloaded');
  };

  const phaseCount = parsedData.filter(d => d.type === 'phase').length;
  const taskCount = parsedData.filter(d => d.type !== 'phase').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Tasks
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import tasks into your Gantt chart.
            Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download button */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Need the correct format?</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File upload area */}
          {!file ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
                isLoading && "opacity-50 pointer-events-none"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
              />
              
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                </div>
              ) : (
                <>
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop your file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports CSV files. Max 1000 rows.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Found {parsedData.length} items to import
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{phaseCount} Phases</Badge>
                  <Badge variant="outline">{taskCount} Tasks</Badge>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16">WBS</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-24">Start</TableHead>
                      <TableHead className="w-24">End</TableHead>
                      <TableHead className="w-16">Days</TableHead>
                      <TableHead className="w-16">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((item, index) => (
                      <TableRow 
                        key={index}
                        className={cn(
                          item.type === 'phase' && 'bg-muted/30 font-medium'
                        )}
                      >
                        <TableCell className="font-mono text-xs">
                          {item.wbs || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.type === 'phase' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {item.type || 'task'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs capitalize">
                          {item.status?.replace('_', ' ') || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.startDate || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.endDate || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.duration || '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.progress ?? 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 50 && (
                  <div className="p-2 text-center text-xs text-muted-foreground border-t">
                    Showing 50 of {parsedData.length} items
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={parsedData.length === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {parsedData.length} Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
