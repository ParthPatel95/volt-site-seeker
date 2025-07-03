
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Zap,
  FileCheck,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';

interface DueDiligenceDocument {
  id: string;
  name: string;
  type: 'financial' | 'technical' | 'legal' | 'environmental' | 'regulatory';
  file_size: string;
  description: string;
  requires_nda: boolean;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

interface VoltMarketDueDiligenceProps {
  listingId: string;
  hasSignedNDA: boolean;
  onSignNDA: () => void;
  onRequestAccess: (documentId: string) => void;
}

export const VoltMarketDueDiligence: React.FC<VoltMarketDueDiligenceProps> = ({
  listingId,
  hasSignedNDA,
  onSignNDA,
  onRequestAccess
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [documents, setDocuments] = useState<DueDiligenceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_due_diligence_documents')
        .select('*')
        .eq('listing_id', listingId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load due diligence documents.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [listingId]);

  const categories = [
    { value: 'all', label: 'All Documents', icon: FileText },
    { value: 'financial', label: 'Financial', icon: Building2 },
    { value: 'technical', label: 'Technical', icon: Zap },
    { value: 'legal', label: 'Legal', icon: FileCheck },
    { value: 'environmental', label: 'Environmental', icon: AlertCircle },
    { value: 'regulatory', label: 'Regulatory', icon: Shield }
  ];

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedCategory);

  const getTypeColor = (type: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-800',
      technical: 'bg-blue-100 text-blue-800',
      legal: 'bg-purple-100 text-purple-800',
      environmental: 'bg-yellow-100 text-yellow-800',
      regulatory: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (doc: DueDiligenceDocument) => {
    if (!doc.requires_nda) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (hasSignedNDA) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Lock className="w-4 h-4 text-gray-400" />;
  };

  const handleDownload = (doc: DueDiligenceDocument) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      toast({
        title: "Document Unavailable",
        description: "This document is not yet available for download.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NDA Status */}
      {!hasSignedNDA && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-amber-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">
                  Non-Disclosure Agreement Required
                </h3>
                <p className="text-amber-700 mb-4">
                  Most due diligence documents require a signed NDA to access. This protects
                  sensitive business information while allowing serious buyers to review detailed documentation.
                </p>
                <Button onClick={onSignNDA} className="bg-amber-600 hover:bg-amber-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Sign NDA & Request Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Due Diligence Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc)}
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{doc.name}</h4>
                      <Badge className={getTypeColor(doc.type)}>
                        {doc.type}
                      </Badge>
                      {doc.requires_nda && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          NDA Required
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Size: {doc.file_size}</span>
                      <span>Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(!doc.requires_nda || hasSignedNDA) ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onRequestAccess(doc.id)}
                      disabled={doc.requires_nda && !hasSignedNDA}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Request Access
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents available in this category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
