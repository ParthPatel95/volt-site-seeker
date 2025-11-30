import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Grid3x3, List, ChevronLeft, ChevronRight,
  Image, Video, Music, File, FileText, Eye,
  Folder, FolderOpen, ChevronDown, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FolderGalleryViewProps {
  documents: any[];
  folders: any[];
  rootFolder: any;
  foldersByParent: Map<string, any[]>;
  documentsByFolder: Map<string, any[]>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  onDocumentSelect: (document: any) => void;
}

const getFileCategory = (fileType: string | null): string => {
  if (!fileType) return 'other';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('word') || type.includes('excel') || type.includes('powerpoint') || 
      type.includes('document') || type.includes('spreadsheet') || type.includes('presentation')) {
    return 'document';
  }
  return 'other';
};

const getFileIcon = (category: string) => {
  switch (category) {
    case 'pdf':
    case 'document':
      return FileText;
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    default:
      return File;
  }
};

const getFileCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    all: 'All Files',
    pdf: 'PDF',
    image: 'Images',
    video: 'Videos',
    audio: 'Audio',
    document: 'Documents',
    other: 'Other'
  };
  return labels[category] || category;
};

export function FolderGalleryView({
  documents,
  folders,
  rootFolder,
  foldersByParent,
  documentsByFolder,
  selectedFolderId,
  onFolderSelect,
  onDocumentSelect
}: FolderGalleryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 20;
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set([rootFolder?.id ?? ''])
  );

  // Helper to get all descendant folder IDs
  const getDescendantFolderIds = (folderId: string): string[] => {
    const children = foldersByParent.get(folderId) || [];
    const childIds: string[] = [];
    for (const child of children) {
      childIds.push(child.id);
      const childDescendants = getDescendantFolderIds(child.id);
      childIds.push(...childDescendants);
    }
    return Array.from(new Set(childIds));
  };

  // Get documents in current folder and all subfolders
  const currentFolderIds = [selectedFolderId, ...getDescendantFolderIds(selectedFolderId)];
  const allCurrentDocuments = currentFolderIds.flatMap((id) => documentsByFolder.get(id) || []);

  // Filter and sort documents
  const filteredDocuments = allCurrentDocuments
    .filter((doc) => {
      if (searchQuery && !doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedFileType !== 'all' && getFileCategory(doc.file_type) !== selectedFileType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.file_name.localeCompare(b.file_name);
        case 'name-desc':
          return b.file_name.localeCompare(a.file_name);
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          return getFileCategory(a.file_type).localeCompare(getFileCategory(b.file_type));
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFileType, sortBy, selectedFolderId]);

  // Count documents by file type
  const fileTypeCounts = allCurrentDocuments.reduce((acc, doc) => {
    const category = getFileCategory(doc.file_type);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Breadcrumb navigation
  const getBreadcrumbs = () => {
    const breadcrumbs: any[] = [];
    let currentId = selectedFolderId;
    const allFolders = [rootFolder, ...folders];

    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parent_folder_id;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Folder tree rendering
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolderTree = (parentId: string, depth = 0): JSX.Element[] => {
    const children = (foldersByParent.get(parentId) || [])
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return children.map((folder) => {
      const isActive = folder.id === selectedFolderId;
      const hasChildren = (foldersByParent.get(folder.id) || []).length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      
      const descendantIds = getDescendantFolderIds(folder.id);
      const allFolderIds = [folder.id, ...descendantIds];
      const docsInFolderCount = allFolderIds.reduce(
        (sum, id) => sum + (documentsByFolder.get(id)?.length || 0),
        0
      );

      return (
        <div key={folder.id} className="relative">
          <div 
            className={cn(
              "flex items-center gap-1 py-1.5 px-2 rounded-md transition-colors mb-0.5 cursor-pointer",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
                className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4.5 flex-shrink-0" /> 
            )}
            
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" />
            )}
            
            <button
              onClick={() => onFolderSelect(folder.id)}
              className="flex-1 text-left text-sm truncate"
            >
              {folder.name || 'Untitled'}
            </button>
            
            <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
              {docsInFolderCount}
            </Badge>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="relative">
              {renderFolderTree(folder.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Helper to create mobile folder options with indentation
  const getMobileFolderOptions = (): Array<{id: string, name: string, depth: number}> => {
    const options: Array<{id: string, name: string, depth: number}> = [];
    
    const traverse = (parentId: string, depth = 0) => {
      const children = (foldersByParent.get(parentId) || [])
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      for (const folder of children) {
        const descendantIds = getDescendantFolderIds(folder.id);
        const allFolderIds = [folder.id, ...descendantIds];
        const docsCount = allFolderIds.reduce(
          (sum, id) => sum + (documentsByFolder.get(id)?.length || 0),
          0
        );
        
        options.push({
          id: folder.id,
          name: `${'  '.repeat(depth)}${folder.name || 'Untitled'} (${docsCount})`,
          depth
        });
        
        traverse(folder.id, depth + 1);
      }
    };
    
    traverse(rootFolder.id);
    return options;
  };
  
  const mobileFolderOptions = getMobileFolderOptions();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Sidebar - Folder Tree (Desktop) */}
      <div className="lg:w-64 lg:flex-shrink-0 hidden lg:block">
        <Card className="p-4 sticky top-24 max-h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Folders
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setExpandedFolders(new Set([rootFolder, ...folders].map(f => f.id)))}
                title="Expand All"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setExpandedFolders(new Set([rootFolder.id]))}
                title="Collapse All"
              >
                <ChevronRightIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-0 pr-2">
              {renderFolderTree(rootFolder.id)}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Mobile Folder Selector */}
        <div className="lg:hidden">
          <Select value={selectedFolderId} onValueChange={onFolderSelect}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {mobileFolderOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
          {breadcrumbs.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2 flex-shrink-0">
              {index > 0 && <ChevronRightIcon className="w-4 h-4" />}
              <button
                onClick={() => onFolderSelect(folder.id)}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === breadcrumbs.length - 1 && "text-foreground font-medium"
                )}
              >
                {folder.name || 'Root'}
              </button>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <Card className="p-4">
          <div className="space-y-3">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="type">File Type</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File Type Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pdf', 'image', 'video', 'audio', 'document', 'other'].map((type) => {
                const count = type === 'all' ? allCurrentDocuments.length : (fileTypeCounts[type] || 0);
                const isActive = selectedFileType === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedFileType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {getFileCategoryLabel(type)} ({count})
                  </button>
                );
              })}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {filteredDocuments.length === allCurrentDocuments.length 
                  ? `${filteredDocuments.length} ${filteredDocuments.length === 1 ? 'document' : 'documents'}`
                  : `${filteredDocuments.length} of ${allCurrentDocuments.length} documents`
                }
              </p>
              {totalPages > 1 && (
                <p className="text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Document Gallery */}
        <div className="flex-1">
          {filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || selectedFileType !== 'all' 
                  ? 'No documents match your filters'
                  : 'No documents in this folder'
                }
              </p>
              {(searchQuery || selectedFileType !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFileType('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedDocuments.map((doc: any) => {
                const category = getFileCategory(doc.file_type);
                const IconComponent = getFileIcon(category);
                const isImage = category === 'image';
                const isPdf = category === 'pdf';
                const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                return (
                  <Card
                    key={doc.id}
                    className="group cursor-pointer overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl"
                    onClick={() => onDocumentSelect(doc)}
                  >
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center overflow-hidden">
                      {isImage && doc.file_url ? (
                        <img 
                          src={doc.file_url} 
                          alt={doc.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : isPdf && !isMobileDevice && doc.file_url ? (
                        <iframe
                          src={`${doc.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="absolute inset-0 w-full h-full pointer-events-none scale-110"
                          title={doc.file_name}
                        />
                      ) : (
                        <IconComponent className="w-16 h-16 text-muted-foreground/40" />
                      )}
                      
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="shadow-lg">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-card border-t">
                      <h3 className="font-semibold text-sm mb-1 truncate" title={doc.file_name}>
                        {doc.file_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {getFileCategoryLabel(category)} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <div className="divide-y">
                {paginatedDocuments.map((doc: any) => {
                  const category = getFileCategory(doc.file_type);
                  const IconComponent = getFileIcon(category);
                  const isImage = category === 'image';

                  return (
                    <button
                      key={doc.id}
                      onClick={() => onDocumentSelect(doc)}
                      className="w-full text-left group p-4 transition-all hover:bg-muted/40 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded overflow-hidden bg-muted/60 flex-shrink-0 flex items-center justify-center">
                        {isImage && doc.file_url ? (
                          <img 
                            src={doc.file_url} 
                            alt={doc.file_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <IconComponent className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 truncate">{doc.file_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {getFileCategoryLabel(category)} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <Eye className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
