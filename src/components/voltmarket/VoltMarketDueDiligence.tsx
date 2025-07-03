
import React, { useState } from 'react';
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

interface DueDiligenceDocument {
  id: string;
  name: string;
  type: 'financial' | 'technical' | 'legal' | 'environmental' | 'regulatory';
  size: string;
  lastUpdated: string;
  requiresNDA: boolean;
  isAvailable: boolean;
  description: string;
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

  // Mock documents - in real implementation, these would come from the database
  const documents: DueDiligenceDocument[] = [
    {
      id: '1',
      name: 'Financial Statements (Last 3 Years)',
      type: 'financial',
      size: '2.5 MB',
      lastUpdated: '2024-01-15',
      requiresNDA: true,
      isAvailable: hasSignedNDA,
      description: 'Audited financial statements including P&L, balance sheet, and cash flow'
    },
    {
      id: '2',
      name: 'Power Infrastructure Assessment',
      type: 'technical',
      size: '15.8 MB',
      lastUpdated: '2024-01-10',
      requiresNDA: true,
      isAvailable: hasSignedNDA,
      description: 'Detailed technical assessment of power infrastructure and capacity'
    },
    {
      id: '3',
      name: 'Environmental Impact Study',
      type: 'environmental',
      size: '8.2 MB',
      lastUpdated: '2023-12-20',
      requiresNDA: true,
      isAvailable: hasSignedNDA,
      description: 'Environmental assessment and compliance documentation'
    },
    {
      id: '4',
      name: 'Utility Interconnection Agreement',
      type: 'legal',
      size: '1.2 MB',
      lastUpdated: '2024-01-05',
      requiresNDA: true,
      isAvailable: hasSignedNDA,
      description: 'Executed utility interconnection agreements and amendments'
    },
    {
      id: '5',
      name: 'Property Survey & Title Report',
      type: 'legal',
      size: '3.7 MB',
      lastUpdated: '2024-01-08',
      requiresNDA: false,
      isAvailable: true,
      description: 'Property survey, title report, and zoning information'
    },
    {
      id: '6',
      name: 'Regulatory Permits & Licenses',
      type: 'regulatory',
      size: '4.1 MB',
      lastUpdated: '2024-01-12',
      requiresNDA: true,
      isAvailable: hasSignedNDA,
      description: 'All applicable permits, licenses, and regulatory approvals'
    }
  ];

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
    if (!doc.requiresNDA) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (doc.isAvailable) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Lock className="w-4 h-4 text-gray-400" />;
  };

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
                      {doc.requiresNDA && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          NDA Required
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Size: {doc.size}</span>
                      <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.isAvailable ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onRequestAccess(doc.id)}
                      disabled={doc.requiresNDA && !hasSignedNDA}
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
