
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketVerification } from '@/hooks/useVoltMarketVerification';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Building, 
  Receipt, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

const VERIFICATION_TYPES = [
  {
    type: 'id_document',
    label: 'Government ID',
    description: 'Driver\'s license, passport, or state ID',
    icon: CreditCard,
    required: true
  },
  {
    type: 'business_license',
    label: 'Business License',
    description: 'Business registration or incorporation documents',
    icon: Building,
    required: true
  },
  {
    type: 'utility_bill',
    label: 'Utility Bill',
    description: 'Recent utility bill for address verification',
    icon: Receipt,
    required: false
  },
  {
    type: 'bank_statement',
    label: 'Bank Statement',
    description: 'Recent bank statement for financial verification',
    icon: FileText,
    required: false
  }
];

export const VoltMarketVerificationCenter: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { loading, submitVerification, getVerifications } = useVoltMarketVerification();
  const { toast } = useToast();
  
  const [verifications, setVerifications] = useState<any[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    const { data, error } = await getVerifications();
    if (error) {
      console.error('Error fetching verifications:', error);
    } else {
      setVerifications(data || []);
    }
  };

  const getVerificationStatus = (type: string) => {
    const verification = verifications.find(v => v.verification_type === type);
    return verification?.status || 'not_submitted';
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or PDF file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingType(type);
    
    try {
      const { data, error } = await submitVerification(type, file);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Document Uploaded",
        description: "Your verification document has been submitted for review"
      });
      
      fetchVerifications();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload verification document",
        variant: "destructive"
      });
    } finally {
      setUploadingType(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(type, file);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const calculateVerificationProgress = () => {
    const completedRequired = VERIFICATION_TYPES
      .filter(vt => vt.required)
      .filter(vt => getVerificationStatus(vt.type) === 'approved').length;
    
    const totalRequired = VERIFICATION_TYPES.filter(vt => vt.required).length;
    
    return (completedRequired / totalRequired) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  };

  const renderVerificationCard = (verificationType: any) => {
    const status = getVerificationStatus(verificationType.type);
    const StatusIcon = getStatusIcon(status);
    const IconComponent = verificationType.icon;
    const verification = verifications.find(v => v.verification_type === verificationType.type);
    
    return (
      <Card key={verificationType.type} className="relative">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconComponent className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{verificationType.label}</h3>
                {verificationType.required && (
                  <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${getStatusColor(status).split(' ')[0]}`} />
              <Badge className={getStatusColor(status)}>
                {status === 'not_submitted' ? 'Not Submitted' : 
                 status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4">{verificationType.description}</p>
          
          {status === 'not_submitted' && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver === verificationType.type 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={(e) => handleDrop(e, verificationType.type)}
              onDragOver={(e) => handleDragOver(e, verificationType.type)}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your document here, or
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRefs.current[verificationType.type]?.click()}
                disabled={uploadingType === verificationType.type}
              >
                {uploadingType === verificationType.type ? 'Uploading...' : 'Choose File'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supports JPEG, PNG, PDF (max 10MB)
              </p>
              
              <input
                ref={(el) => { fileInputRefs.current[verificationType.type] = el; }}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(verificationType.type, file);
                }}
                className="hidden"
              />
            </div>
          )}
          
          {status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Under Review</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Your document is being reviewed by our team. This typically takes 1-2 business days.
              </p>
            </div>
          )}
          
          {status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium">Verified</span>
              </div>
              <p className="text-green-700 text-sm">
                Document verified on {new Date(verification?.verified_at).toLocaleDateString()}
              </p>
            </div>
          )}
          
          {status === 'rejected' && verification?.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-medium">Rejected</span>
              </div>
              <p className="text-red-700 text-sm mb-2">
                Reason: {verification.rejection_reason}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRefs.current[verificationType.type]?.click()}
              >
                Upload New Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">Please sign in to access verification center.</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateVerificationProgress();

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Verification Center</h1>
          <p className="text-muted-foreground">Complete your verification to build trust with other users</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Required Verifications Complete
                  </span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Build trust with verified identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access premium features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Priority in search results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Enhanced credibility badge</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {VERIFICATION_TYPES.map(renderVerificationCard)}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Document Requirements:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Documents must be clear and legible</li>
                  <li>All information must be visible</li>
                  <li>Documents should be recent (within 3 months for utility bills)</li>
                  <li>Files must be under 10MB in size</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Review Process:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Most documents are reviewed within 1-2 business days</li>
                  <li>You'll receive an email notification when review is complete</li>
                  <li>If rejected, you can upload a new document immediately</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Privacy Note:</strong> All uploaded documents are encrypted and stored securely. 
                  They are only used for verification purposes and are not shared with third parties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
