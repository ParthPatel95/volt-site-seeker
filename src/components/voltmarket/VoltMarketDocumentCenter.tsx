import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketDocuments } from '@/hooks/useVoltMarketDocuments';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Lock, 
  Search,
  Filter,
  Plus,
  FolderOpen,
  Shield
} from 'lucide-react';

export const VoltMarketDocumentCenter: React.FC = () => {
  const { documents, loading, fetchDocuments, uploadDocument, downloadDocument, deleteDocument } = useVoltMarketDocuments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);

  // Document upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    documentType: 'other' as string,
    accessLevel: 'private' as string,
    listingId: '',
    isConfidential: false
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

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

    setUploading(true);
    try {
      await uploadDocument(
        uploadForm.file,
        uploadForm.documentType,
        uploadForm.accessLevel,
        uploadForm.listingId || undefined,
        uploadForm.isConfidential
      );
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully"
      });
      
      setUploadForm({
        file: null,
        documentType: 'other',
        accessLevel: 'private',
        listingId: '',
        isConfidential: false
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      await downloadDocument(documentId);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (documentId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
    
    try {
      await deleteDocument(documentId);
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'confidential' && doc.is_confidential) ||
      (activeTab === 'shared' && doc.access_level !== 'private');
    
    return matchesSearch && matchesType && matchesTab;
  });

  const documentTypeColors = {
    financial: 'bg-green-100 text-green-800',
    legal: 'bg-blue-100 text-blue-800',
    technical: 'bg-purple-100 text-purple-800',
    marketing: 'bg-orange-100 text-orange-800',
    due_diligence: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const accessLevelColors = {
    public: 'bg-green-100 text-green-800',
    registered: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    private: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
            <p className="text-gray-600 mt-1">Manage your VoltMarket documents securely</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Organize
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={uploadForm.documentType} onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="due_diligence">Due Diligence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="access-level">Access Level</Label>
                  <Select value={uploadForm.accessLevel} onValueChange={(value) => setUploadForm(prev => ({ ...prev, accessLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="registered">Registered Users</SelectItem>
                      <SelectItem value="verified">Verified Users</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={uploading || !uploadForm.file} className="w-full">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50">
            <TabsTrigger value="all">All Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="confidential">
              Confidential ({documents.filter(d => d.is_confidential).length})
            </TabsTrigger>
            <TabsTrigger value="shared">
              Shared ({documents.filter(d => d.access_level !== 'private').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading documents...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-600 mb-4">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredDocuments.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{document.original_filename}</h3>
                              {document.is_confidential && (
                                <Lock className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge className={documentTypeColors[document.document_type as keyof typeof documentTypeColors]}>
                                {document.document_type.replace('_', ' ')}
                              </Badge>
                              <Badge className={accessLevelColors[document.access_level as keyof typeof accessLevelColors]}>
                                {document.access_level}
                              </Badge>
                              <span>•</span>
                              <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>Uploaded {new Date(document.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(document.id, document.original_filename)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};