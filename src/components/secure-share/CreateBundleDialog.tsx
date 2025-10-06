import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface CreateBundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBundleDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBundleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const { data: documents } = useQuery({
    queryKey: ['available-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleCreate = async () => {
    if (!name || selectedDocs.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a name and select at least one document',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const insertData: any = {
        name,
        description: description || null,
        created_by: user.id,
      };

      const { data: bundle, error: bundleError } = await supabase
        .from('document_bundles')
        .insert([insertData])
        .select()
        .single();

      if (bundleError) throw bundleError;

      const bundleDocs = selectedDocs.map((docId, index) => ({
        bundle_id: bundle.id,
        document_id: docId,
        display_order: index,
      }));

      const { error: docsError } = await supabase
        .from('bundle_documents')
        .insert(bundleDocs);

      if (docsError) throw docsError;

      toast({
        title: 'Bundle created',
        description: `"${name}" has been created with ${selectedDocs.length} documents`,
      });

      setName('');
      setDescription('');
      setSelectedDocs([]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document Bundle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Bundle Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Q4 2024 Investment Package"
            />
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Complete documentation for potential investors"
              rows={3}
            />
          </div>

          <div>
            <Label className="mb-3 block">Select Documents</Label>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {documents?.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleDocument(doc.id)}
                >
                  <Checkbox
                    checked={selectedDocs.includes(doc.id)}
                    onCheckedChange={() => toggleDocument(doc.id)}
                  />
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name || selectedDocs.length === 0}>
              {creating ? 'Creating...' : 'Create Bundle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
