import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  currentFolderId?: string | null;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  currentFolderId = null,
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'folder'>('single');
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Check for file size limit (50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = selectedFiles.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File too large',
        description: `Some files exceed 50MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If uploading a folder, create folder structure first
      let folderMap = new Map<string, string>(); // path -> folder_id
      
      if (uploadMode === 'folder' && files.length > 0) {
        // Extract unique folder paths from all files
        const folderPaths = new Set<string>();
        files.forEach(file => {
          const webkitPath = (file as any).webkitRelativePath;
          if (webkitPath) {
            const pathParts = webkitPath.split('/');
            // Build all parent folder paths
            for (let i = 1; i < pathParts.length; i++) {
              folderPaths.add(pathParts.slice(0, i).join('/'));
            }
          }
        });

        // Sort paths by depth (shortest first) to create parent folders before children
        const sortedPaths = Array.from(folderPaths).sort((a, b) => {
          return a.split('/').length - b.split('/').length;
        });

        // Create folders in order
        for (const folderPath of sortedPaths) {
          const pathParts = folderPath.split('/');
          const folderName = pathParts[pathParts.length - 1];
          const parentPath = pathParts.slice(0, -1).join('/');
          const parentFolderId = parentPath ? folderMap.get(parentPath) : currentFolderId;

          // Check if folder already exists with same name and parent
          const { data: existingFolder } = await supabase
            .from('secure_folders')
            .select('id')
            .eq('name', folderName)
            .eq('created_by', user.id)
            .eq('is_active', true)
            .eq('parent_folder_id', parentFolderId || null)
            .maybeSingle();

          if (existingFolder) {
            folderMap.set(folderPath, existingFolder.id);
          } else {
            // Create new folder
            const { data: newFolder, error: folderError } = await supabase
              .from('secure_folders')
              .insert([{
                created_by: user.id,
                name: folderName,
                parent_folder_id: parentFolderId || null,
              }])
              .select('id')
              .single();

            if (folderError) throw folderError;
            if (newFolder) {
              folderMap.set(folderPath, newFolder.id);
            }
          }
        }
      }

      // Upload files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        // Determine folder_id based on file path
        let fileFolderId = currentFolderId;
        if (uploadMode === 'folder') {
          const webkitPath = (file as any).webkitRelativePath;
          if (webkitPath) {
            const pathParts = webkitPath.split('/');
            if (pathParts.length > 1) {
              const folderPath = pathParts.slice(0, -1).join('/');
              fileFolderId = folderMap.get(folderPath) || currentFolderId;
            }
          }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('secure-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('secure-documents')
          .getPublicUrl(fileName);

        const insertData: any = {
          created_by: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
          storage_path: fileName,
          category,
          description: description || null,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          folder_id: fileFolderId,
        };

        const { error: dbError } = await supabase
          .from('secure_documents')
          .insert([insertData]);

        if (dbError) throw dbError;
      }

      toast({
        title: files.length > 1 ? 'Documents uploaded' : 'Document uploaded',
        description: `Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`,
      });

      setFiles([]);
      setDescription('');
      setTags('');
      setCategory('other');
      setUploadProgress(null);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Secure Document{uploadMode === 'folder' ? 's' : ''}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={uploadMode === 'single' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => {
                setUploadMode('single');
                setFiles([]);
              }}
            >
              Single File
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'folder' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => {
                setUploadMode('folder');
                setFiles([]);
              }}
            >
              Upload Folder
            </Button>
          </div>

            <div>
            <Label>File Upload</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              All file types supported • Max 50MB per file
            </p>
            <div className="mt-2 flex items-center gap-4">
              <Input
                type="file"
                onChange={handleFileChange}
                accept="*/*"
                className="flex-1"
                multiple={uploadMode === 'folder'}
                {...(uploadMode === 'folder' ? { 
                  // @ts-ignore - webkitdirectory is non-standard but supported
                  webkitdirectory: '', 
                  directory: '' 
                } : {})}
              />
              {files.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {files.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p className="font-medium">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                {files.slice(0, 3).map((f, i) => (
                  <p key={i} className="text-xs truncate">
                    • {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ))}
                {files.length > 3 && (
                  <p className="text-xs">...and {files.length - 3} more</p>
                )}
              </div>
            )}
            {uploadProgress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress.current} / {uploadProgress.total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-watt-primary transition-all"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investor_deck">Investor Deck</SelectItem>
                <SelectItem value="energy_bill">Energy Bill</SelectItem>
                <SelectItem value="loi">LOI</SelectItem>
                <SelectItem value="ppa">PPA</SelectItem>
                <SelectItem value="land_title">Land Title</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document"
              rows={3}
            />
          </div>

          <div>
            <Label>Tags (Optional)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Q4 2024, Alberta, 45MW (comma-separated)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading
                ? `Uploading... (${uploadProgress?.current}/${uploadProgress?.total})`
                : files.length > 1
                ? `Upload ${files.length} Documents`
                : 'Upload Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
