import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Folder, FileText, Trash2, Edit, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateBundleDialog } from './CreateBundleDialog';
import { CreateLinkDialog } from './CreateLinkDialog';

export function BundlesTab() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const { toast } = useToast();

  const { data: bundles, isLoading, refetch } = useQuery({
    queryKey: ['document-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_bundles')
        .select(`
          *,
          bundle_documents (
            id,
            document:secure_documents (
              id,
              file_name,
              category
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleShareBundle = (bundle: any) => {
    setSelectedBundle(bundle);
    setShareDialogOpen(true);
  };

  const handleDeleteBundle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_bundles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Bundle deleted',
        description: 'Document bundle has been removed',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Document Bundles</h2>
            <p className="text-muted-foreground">
              Create organized collections of documents to share together
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-24 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeBundles = bundles?.filter(b => b.is_active) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Bundles</h2>
          <p className="text-muted-foreground">
            Create organized collections of documents to share together
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {activeBundles.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No bundles yet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Bundle multiple documents together to share as a single collection
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Bundle
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeBundles.map((bundle: any) => (
            <Card key={bundle.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{bundle.name}</h3>
                    {bundle.description && (
                      <p className="text-sm text-muted-foreground">{bundle.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShareBundle(bundle)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteBundle(bundle.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  <span>{bundle.bundle_documents?.length || 0} documents</span>
                </div>
                
                {bundle.bundle_documents?.slice(0, 3).map((bd: any) => (
                  <div key={bd.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bd.document?.file_name}</span>
                    {bd.document?.category && (
                      <Badge variant="secondary" className="text-xs">
                        {bd.document.category.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                ))}
                
                {(bundle.bundle_documents?.length || 0) > 3 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    +{bundle.bundle_documents.length - 3} more documents
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateBundleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      {selectedBundle && (
        <CreateLinkDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          bundleId={selectedBundle.id}
          documentName={selectedBundle.name}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
