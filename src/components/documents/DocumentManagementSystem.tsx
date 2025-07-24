import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Download, 
  Share2, 
  FileText, 
  Image, 
  FileIcon, 
  Search,
  Filter,
  FolderPlus,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  document_type: string;
  description: string;
  is_private: boolean;
  created_at: string;
  uploader_id: string;
  listing_id?: string;
}

interface Folder {
  id: string;
  name: string;
  documents: Document[];
  created_at: string;
}

export function DocumentManagementSystem() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    document_type: '',
    description: '',
    is_private: true,
    folder_id: ''
  });
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    // Simulate folder structure - in real app, this would come from database
    const mockFolders: Folder[] = [
      { id: '1', name: 'Financial Reports', documents: [], created_at: new Date().toISOString() },
      { id: '2', name: 'Legal Documents', documents: [], created_at: new Date().toISOString() },
      { id: '3', name: 'Technical Specs', documents: [], created_at: new Date().toISOString() }
    ];
    setFolders(mockFolders);
  };

  const handleFileUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadForm.file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadForm.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document metadata to database
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from('voltmarket_documents')
        .insert({
          file_name: uploadForm.file.name,
          file_url: publicUrl,
          file_type: uploadForm.file.type,
          file_size: uploadForm.file.size,
          document_type: uploadForm.document_type,
          description: uploadForm.description,
          is_private: uploadForm.is_private,
          uploader_id: user?.id || ''
        });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded successfully",
        description: `${uploadForm.file.name} has been uploaded`
      });

      // Reset form
      setUploadForm({
        file: null,
        document_type: '',
        description: '',
        is_private: true,
        folder_id: ''
      });

      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      documents: [],
      created_at: new Date().toISOString()
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    
    toast({
      title: "Folder created",
      description: `Folder "${newFolderName}" has been created`
    });
  };

  const downloadDocument = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.file_url;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareDocument = async (doc: Document) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.file_name,
          text: doc.description,
          url: doc.file_url
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(doc.file_url);
        toast({
          title: "Link copied",
          description: "Document link copied to clipboard"
        });
      }
    } else {
      navigator.clipboard.writeText(doc.file_url);
      toast({
        title: "Link copied",
        description: "Document link copied to clipboard"
      });
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('voltmarket_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted"
      });
      
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Upload, organize, and share your documents</p>
        </div>
        <Button onClick={() => setSelectedFolder(null)} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.file_type)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{doc.file_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                    {doc.is_private && (
                      <Badge variant="secondary" className="text-xs">Private</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadDocument(doc)}
                      className="gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareDocument(doc)}
                      className="gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDocument(doc.id)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">Upload your first document to get started</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="New folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createFolder} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Create Folder
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="w-5 h-5" />
                    {folder.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {folder.documents.length} documents
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload New Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setUploadForm(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select
                      value={uploadForm.document_type}
                      onValueChange={(value) => setUploadForm(prev => ({ 
                        ...prev, 
                        document_type: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Document description..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-private"
                    checked={uploadForm.is_private}
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      is_private: e.target.checked 
                    }))}
                  />
                  <Label htmlFor="is-private">Private document</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}