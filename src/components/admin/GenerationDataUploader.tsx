import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

interface UploadStats {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  currentFile: string;
  errors: { row: number; error: string }[];
}

const CHUNK_SIZE = 5000; // Rows per batch

export const GenerationDataUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const csvFiles = selectedFiles.filter(f => f.name.endsWith('.csv'));
    setFiles(csvFiles);
    setUploadComplete(false);
    setStats(null);
    
    // Preview first file headers
    if (csvFiles.length > 0) {
      Papa.parse(csvFiles[0], {
        preview: 1,
        complete: (results) => {
          if (results.data.length > 0) {
            setDetectedColumns(results.data[0] as string[]);
          }
        }
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFiles = droppedFiles.filter(f => f.name.endsWith('.csv'));
    setFiles(csvFiles);
    setUploadComplete(false);
    setStats(null);
  }, []);

  const uploadChunk = async (rows: Record<string, unknown>[]): Promise<{
    success: boolean;
    processed?: number;
    parseErrors?: number;
    error?: string;
  }> => {
    const { data, error } = await supabase.functions.invoke('aeso-generation-upload', {
      body: { rows }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  };

  const processFile = async (file: File, currentStats: UploadStats): Promise<UploadStats> => {
    return new Promise((resolve) => {
      let rowBuffer: Record<string, unknown>[] = [];
      let fileRowCount = 0;
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunk: async (results, parser) => {
          parser.pause();
          
          rowBuffer.push(...(results.data as Record<string, unknown>[]));
          fileRowCount += results.data.length;
          
          // Process in chunks
          while (rowBuffer.length >= CHUNK_SIZE) {
            const chunk = rowBuffer.splice(0, CHUNK_SIZE);
            const result = await uploadChunk(chunk);
            
            if (result.success) {
              currentStats.successfulRows += result.processed || 0;
              currentStats.failedRows += result.parseErrors || 0;
            } else {
              currentStats.failedRows += chunk.length;
              currentStats.errors.push({ row: currentStats.processedRows, error: result.error || 'Unknown error' });
            }
            
            currentStats.processedRows += chunk.length;
            setStats({ ...currentStats });
          }
          
          parser.resume();
        },
        complete: async () => {
          // Process remaining rows
          if (rowBuffer.length > 0) {
            const result = await uploadChunk(rowBuffer);
            
            if (result.success) {
              currentStats.successfulRows += result.processed || 0;
              currentStats.failedRows += result.parseErrors || 0;
            } else {
              currentStats.failedRows += rowBuffer.length;
              currentStats.errors.push({ row: currentStats.processedRows, error: result.error || 'Unknown error' });
            }
            
            currentStats.processedRows += rowBuffer.length;
          }
          
          currentStats.totalRows += fileRowCount;
          setStats({ ...currentStats });
          resolve(currentStats);
        },
        error: (error) => {
          currentStats.errors.push({ row: 0, error: `Parse error: ${error.message}` });
          resolve(currentStats);
        }
      });
    });
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadComplete(false);
    
    let currentStats: UploadStats = {
      totalRows: 0,
      processedRows: 0,
      successfulRows: 0,
      failedRows: 0,
      currentFile: '',
      errors: []
    };
    
    setStats(currentStats);
    
    for (const file of files) {
      currentStats.currentFile = file.name;
      setStats({ ...currentStats });
      currentStats = await processFile(file, currentStats);
    }
    
    setIsUploading(false);
    setUploadComplete(true);
  };

  const progressPercent = stats && stats.totalRows > 0 
    ? Math.round((stats.processedRows / stats.totalRows) * 100)
    : stats?.processedRows 
      ? Math.min(95, Math.round(stats.processedRows / 100)) 
      : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Generation Data Upload
        </CardTitle>
        <CardDescription>
          Upload CSV files with historical generation data by fuel type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        >
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
            disabled={isUploading}
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop CSV files or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports multiple files, processes in 5,000-row chunks
            </p>
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files:</p>
            <div className="flex flex-wrap gap-2">
              {files.map((file, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Detected Columns */}
        {detectedColumns.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Detected columns:</p>
              <p className="text-xs text-muted-foreground">
                {detectedColumns.join(', ')}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {stats && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Processing: {stats.currentFile}</span>
              <span>{stats.processedRows.toLocaleString()} rows</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{stats.successfulRows.toLocaleString()} updated</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{stats.failedRows.toLocaleString()} failed</span>
              </div>
              <div className="text-muted-foreground">
                {progressPercent}% complete
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {stats && stats.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium mb-1">Errors ({stats.errors.length}):</p>
              <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                {stats.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>Row {err.row}: {err.error}</li>
                ))}
                {stats.errors.length > 5 && (
                  <li>...and {stats.errors.length - 5} more</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Complete Message */}
        {uploadComplete && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Upload complete! {stats?.successfulRows.toLocaleString()} records updated.
              Run model retraining to see improved predictions.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={startUpload}
          disabled={files.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GenerationDataUploader;
