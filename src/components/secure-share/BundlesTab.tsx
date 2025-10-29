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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Document Bundles</h2>
            <p className="text-sm text-muted-foreground">
              Organized collections of documents
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse border-border/50">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeBundles = bundles?.filter(b => b.is_active) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Document Bundles</h2>
          <p className="text-sm text-muted-foreground">
            Organized collections for streamlined sharing
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-watt-primary to-watt-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {activeBundles.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 bg-gradient-to-br from-card to-muted/20">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-watt-primary to-watt-secondary rounded-full blur-xl opacity-20" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                <Package className="w-10 h-10 text-watt-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No bundles yet</h3>
              <p className="text-muted-foreground mb-4">
                Bundle multiple documents together to share as a single organized collection
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-watt-primary to-watt-secondary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Bundle
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {activeBundles.map((bundle: any) => (
            <Card key={bundle.id} className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:border-watt-primary/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-watt-primary/0 to-watt-secondary/0 group-hover:from-watt-primary/5 group-hover:to-watt-secondary/5 transition-all duration-300" />
              
              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative shrink-0 group/icon">
                      <div className="absolute -inset-1 bg-gradient-to-r from-watt-primary to-watt-secondary rounded-lg blur opacity-0 group-hover/icon:opacity-25 transition" />
                      <div className="relative p-2.5 rounded-lg bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                        <Folder className="w-5 h-5 text-watt-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg mb-1">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{bundle.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShareBundle(bundle)}
                      className="hover:bg-watt-primary/10 hover:text-watt-primary"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-watt-secondary/10 hover:text-watt-secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteBundle(bundle.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 rounded-md bg-muted">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{bundle.bundle_documents?.length || 0}</span>
                    <span className="text-muted-foreground">documents</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {bundle.bundle_documents?.slice(0, 3).map((bd: any) => (
                      <div key={bd.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm flex-1 truncate">{bd.document?.file_name}</span>
                        {bd.document?.category && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {bd.document.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {(bundle.bundle_documents?.length || 0) > 3 && (
                      <p className="text-xs text-muted-foreground pl-2 pt-1">
                        +{bundle.bundle_documents.length - 3} more documents
                      </p>
                    )}
                  </div>
                </div>
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
