import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Plus, FileText, Download, Link as LinkIcon, Trash2, ExternalLink, Eye, Search, Grid, List, Filter, MoreVertical, Calendar, Tag } from 'lucide-react';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { CreateLinkDialog } from './CreateLinkDialog';
import { DocumentViewerDialog } from './DocumentViewerDialog';
import { DocumentThumbnail } from './DocumentThumbnail';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentsTab() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createLinkDialogOpen, setCreateLinkDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string; storage_path: string; file_type: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['secure-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secure_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('secure_documents')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Document deleted',
        description: 'The document has been removed successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      investor_deck: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      energy_bill: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      loi: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      ppa: 'bg-green-500/10 text-green-600 border-green-500/20',
      land_title: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      financial: 'bg-red-500/10 text-red-600 border-red-500/20',
      legal: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      technical: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };
    return colors[category] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    let filtered = documents.filter(doc => {
      const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [documents, searchQuery, filterCategory, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Documents</h2>
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-watt-primary to-watt-primary/90 hover:from-watt-primary/90 hover:to-watt-primary shadow-lg hover:shadow-watt-glow transition-all"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 border-watt-primary/20 shadow-md">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:ring-watt-primary"
            />
          </div>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="size">Size (Largest)</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-watt-primary hover:bg-watt-primary/90' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-watt-primary hover:bg-watt-primary/90' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse border-watt-primary/10">
              <div className={viewMode === 'grid' ? 'aspect-[3/4] bg-gradient-to-br from-muted to-muted/50' : 'h-24 bg-gradient-to-r from-muted to-muted/50'} />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredDocuments && filteredDocuments.length > 0 ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredDocuments.map((doc) => (
            <Card 
              key={doc.id} 
              className={`group overflow-hidden border-watt-primary/10 hover:border-watt-primary/30 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-watt-primary/5 ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/50 relative overflow-hidden border-b border-watt-primary/10">
                    <DocumentThumbnail
                      fileUrl={doc.file_url}
                      fileType={doc.file_type}
                      storagePath={doc.storage_path}
                    />

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm font-medium shadow-sm ${getCategoryBadge(
                          doc.category
                        )}`}
                      >
                        {doc.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg backdrop-blur-sm"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-watt-primary hover:bg-watt-primary/90 shadow-lg"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setCreateLinkDialogOpen(true);
                        }}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-watt-primary transition-colors">
                        {doc.file_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </div>
                      {doc.file_size && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-watt-primary/10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-watt-primary/10 hover:border-watt-primary transition-all"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-watt-primary/10 hover:border-watt-primary transition-all"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setCreateLinkDialogOpen(true);
                        }}
                      >
                        <LinkIcon className="w-3 h-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0 bg-gradient-to-br from-muted/30 to-muted/50 relative overflow-hidden">
                    <DocumentThumbnail
                      fileUrl={doc.file_url}
                      fileType={doc.file_type}
                      storagePath={doc.storage_path}
                    />
                  </div>

                  <div className="flex-1 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-watt-primary transition-colors">
                          {doc.file_name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border backdrop-blur-sm font-medium flex-shrink-0 ${getCategoryBadge(
                            doc.category
                          )}`}
                        >
                          {doc.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </span>
                        {doc.file_size && (
                          <span>{formatFileSize(doc.file_size)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-watt-primary/10 hover:border-watt-primary"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-watt-primary hover:bg-watt-primary/90"
                        onClick={() => {
                          setSelectedDocument({
                            id: doc.id,
                            name: doc.file_name,
                            storage_path: doc.storage_path,
                            file_type: doc.file_type
                          });
                          setCreateLinkDialogOpen(true);
                        }}
                      >
                        <LinkIcon className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-watt-primary/20 bg-gradient-to-br from-card to-watt-primary/5 shadow-lg">
          <div className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-watt-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {searchQuery || filterCategory !== 'all' ? 'No documents found' : 'No documents yet'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                  {searchQuery || filterCategory !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Upload your first document to get started with secure sharing'
                  }
                </p>
                {!searchQuery && filterCategory === 'all' && (
                  <Button 
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-gradient-to-r from-watt-primary to-watt-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => refetch()}
      />

      {selectedDocument && (
        <>
          <CreateLinkDialog
            open={createLinkDialogOpen}
            onOpenChange={setCreateLinkDialogOpen}
            documentId={selectedDocument.id}
            documentName={selectedDocument.name}
            onSuccess={() => refetch()}
          />

          <DocumentViewerDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            document={selectedDocument}
          />
        </>
      )}
    </div>
  );
}
