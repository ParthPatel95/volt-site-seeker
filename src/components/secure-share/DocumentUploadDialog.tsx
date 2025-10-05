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
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, DOCX, XLSX, or PPTX files only',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Starting upload for user:', user.id);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading to storage:', fileName);
      const { error: uploadError } = await supabase.storage
        .from('secure-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Storage upload successful');

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
      };

      console.log('Inserting document record:', insertData);
      const { data: insertResult, error: dbError } = await supabase
        .from('secure_documents')
        .insert([insertData])
        .select();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      console.log('Insert successful:', insertResult);

      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully',
      });

      setFile(null);
      setDescription('');
      setTags('');
      setCategory('other');
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Secure Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>File Upload</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.pptx"
                className="flex-1"
              />
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
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
              disabled={!file || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
