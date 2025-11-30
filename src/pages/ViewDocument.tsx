import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Clock, FileText, ArrowLeft, Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Image, Video, Music, File, Folder, FolderOpen, Globe } from 'lucide-react';
import { PasswordProtection } from '@/components/secure-share/viewer/PasswordProtection';
import { NDASignature } from '@/components/secure-share/viewer/NDASignature';
import { DocumentViewer } from '@/components/secure-share/viewer/DocumentViewer';
import { ViewerInfoCollection } from '@/components/secure-share/viewer/ViewerInfoCollection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function ViewDocument() {
  const { token: routeToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('doc');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [viewStartTime] = useState(Date.now());
  const [viewerData, setViewerData] = useState<{ name: string; email: string } | null>(null);
  
  // Helper function to fetch signed URL with retry logic
  const fetchSignedUrlWithRetry = async (storagePath: string, expiresIn: number, retries = 3): Promise<string | null> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('get-signed-url', {
          body: { storagePath, expiresIn }
        });

        if (error) {
          console.error(`[ViewDocument] Signed URL error (attempt ${attempt}):`, error);
          if (attempt === retries) return null;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        if (data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.error(`[ViewDocument] Exception fetching signed URL (attempt ${attempt}):`, err);
        if (attempt === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  };
  
  // Enhanced token extraction with multiple fallback strategies
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  // Try multiple extraction methods
  let extractedToken = routeToken;
  
  if (!extractedToken) {
    // Method 1: Extract from pathname segments
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const viewIndex = pathSegments.indexOf('view');
    if (viewIndex !== -1 && pathSegments[viewIndex + 1]) {
      extractedToken = pathSegments[viewIndex + 1];
    }
  }
  
  if (!extractedToken) {
    // Method 2: Extract last path segment (fallback)
    const lastSegment = window.location.pathname.split('/').filter(Boolean).pop();
    if (lastSegment && lastSegment !== 'view') {
      extractedToken = lastSegment;
    }
  }
  
  if (!extractedToken && isIOS) {
    // Method 3: iOS-specific hash extraction (some apps modify URLs)
    const hashMatch = window.location.hash.match(/[a-f0-9-]{36}/i);
    if (hashMatch) {
      extractedToken = hashMatch[0];
    }
  }
  
  const token = extractedToken;
  
  console.log('[ViewDocument] Token extraction:', {
    isIOS,
    routeToken,
    extractedToken,
    finalToken: token,
    pathname: window.location.pathname,
    href: window.location.href
  });
  
  // Fetch link data - no authentication required (security via token)
  const { data: linkData, isLoading, error } = useQuery({
    queryKey: ['secure-link', token],
    enabled: !!token, // Security via token, no platform auth required
    queryFn: async () => {
      console.log('[ViewDocument] Starting query for token:', token);
      if (!token) throw new Error('No token provided');

      try {
        const { data: link, error: linkError } = await supabase
          .from('secure_links')
          .select(`
            *,
            document:secure_documents(*),
            bundle:document_bundles(
              *,
              bundle_documents(
                document:secure_documents(*)
              )
            ),
            folder:secure_folders(*)
          `)
          .eq('link_token', token)
          .single();

        if (linkError) {
          console.error('[ViewDocument] Link fetch error:', linkError);
          throw linkError;
        }
        
        console.log('[ViewDocument] Link data fetched successfully');

        // Check if link is valid
        if (link.status === 'revoked') {
          throw new Error('This link has been revoked');
        }

        if (link.status === 'expired' || (link.expires_at && new Date(link.expires_at) < new Date())) {
          throw new Error('This link has expired');
        }

        if (link.max_views && link.current_views >= link.max_views) {
          throw new Error('This link has reached its maximum views');
        }

      // Helper function to get all folder IDs including nested subfolders
      const getAllFolderIds = async (folderId: string): Promise<string[]> => {
        const folderIds = [folderId];
        const { data: subfolders } = await supabase
          .from('secure_folders')
          .select('id')
          .eq('parent_folder_id', folderId)
          .eq('is_active', true);
        
        if (subfolders && subfolders.length > 0) {
          for (const subfolder of subfolders) {
            const nestedIds = await getAllFolderIds(subfolder.id);
            folderIds.push(...nestedIds);
          }
        }
        
        return folderIds;
      };

      // Handle folder, bundle, or single document
      if (link.folder_id) {
        // Load folder contents (including nested subfolders) via Edge Function
        const { data: folderData, error: folderError } = await supabase.functions.invoke(
          'get-folder-contents',
          {
            body: { token },
          }
        );

        if (folderError) {
          console.error('[ViewDocument] get-folder-contents error:', folderError);
          throw new Error('Failed to load folder contents');
        }

        const folderContents: any = folderData;
        const folderDocs = folderContents?.documents || [];

        if (!folderDocs || folderDocs.length === 0) {
          throw new Error('Folder contains no documents');
        }

        let expirySeconds = 86400; // Default 24 hours
        if (link.expires_at) {
          const expiryTime = new Date(link.expires_at).getTime();
          const now = Date.now();
          expirySeconds = Math.max(60, Math.floor((expiryTime - now) / 1000));
        }

        console.log('[ViewDocument] Folder contents loaded, documents count:', folderDocs.length);

        // Generate signed URLs for all documents in the folder in parallel for performance
        await Promise.all(
          folderDocs.map(async (doc: any) => {
            if (!doc.storage_path) return;

            const signedUrl = await fetchSignedUrlWithRetry(doc.storage_path, expirySeconds);
            if (signedUrl) {
              doc.file_url = signedUrl;
            } else {
              console.error('[ViewDocument] Failed to get signed URL for:', doc.file_name);
            }
          })
        );

        // Attach folder contents for rendering
        (link as any).folder_contents = folderContents;

        return link;
      } else if (link.bundle_id) {
        // This is a bundle - get signed URLs for all documents
        const bundleDocs = link.bundle.bundle_documents || [];
        
        if (bundleDocs.length === 0) {
          throw new Error('Bundle contains no documents');
        }

        let expirySeconds = 86400; // Default 24 hours
        if (link.expires_at) {
          const expiryTime = new Date(link.expires_at).getTime();
          const now = Date.now();
          expirySeconds = Math.max(60, Math.floor((expiryTime - now) / 1000));
        }

        console.log('[ViewDocument] Bundle documents count:', bundleDocs.length);

        // Generate signed URLs for all documents in the bundle in parallel
        await Promise.all(
          bundleDocs.map(async (bundleDoc: any) => {
            const doc = bundleDoc.document;
            if (!doc || !doc.storage_path) return;

            const signedUrl = await fetchSignedUrlWithRetry(doc.storage_path, expirySeconds);
            if (signedUrl) {
              doc.file_url = signedUrl;
            } else {
              console.error('[ViewDocument] Failed to get signed URL for bundle doc:', doc.file_name);
            }
          })
        );

        return link;
      } else if (link.document_id) {
        // This is a single document
        const storagePath = link.document.storage_path;
        
        if (!storagePath) {
          console.error('No storage path found for document:', link.document);
          throw new Error('Document storage path not found');
        }

        let expirySeconds = 86400; // Default 24 hours
        
        if (link.expires_at) {
          const expiryTime = new Date(link.expires_at).getTime();
          const now = Date.now();
          expirySeconds = Math.max(60, Math.floor((expiryTime - now) / 1000));
        }

        console.log('Creating signed URL for:', storagePath, 'expiry:', expirySeconds);
        
        const signedUrl = await fetchSignedUrlWithRetry(storagePath, expirySeconds);

        if (signedUrl) {
          console.log('Signed URL created successfully');
          link.document.file_url = signedUrl;
        } else {
          console.error('Failed to generate signed URL after retries');
          throw new Error('Failed to generate document access URL');
        }

        return link;
      } else {
        throw new Error('Invalid link: no document, bundle, or folder associated');
      }
      } catch (queryError: any) {
        console.error('[ViewDocument] Query error:', queryError);
        throw queryError;
      }
    },
    retry: false
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      console.error('[ViewDocument] Query failed:', error);
      toast({
        title: 'Error Loading Document',
        description: error instanceof Error ? error.message : 'Failed to load the document. Please try again.',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Clear stored auth return URL once document loads successfully
  useEffect(() => {
    if (linkData && user) {
      console.log('[ViewDocument] Document loaded successfully, cleaning up auth return URLs');
      localStorage.removeItem('authReturnUrl');
      sessionStorage.removeItem('authReturnUrl');
    }
  }, [linkData, user]);

  // Increment view count when link is accessed
  useEffect(() => {
    if (!linkData) return;
    // Only track when password is not required OR when viewer data is collected
    if (!linkData.password_hash || viewerData) {
      const incrementViewCount = async () => {
        try {
          // Increment view count (RLS allows public update on this specific action)
          await supabase
            .from('secure_links')
            .update({ 
              current_views: (linkData.current_views || 0) + 1,
              last_accessed_at: new Date().toISOString()
            })
            .eq('id', linkData.id);
        } catch (error) {
          console.error('Failed to increment view count:', error);
        }
      };

      incrementViewCount();
    }
  }, [linkData, viewerData]);

  // Disable right-click for view-only access
  useEffect(() => {
    if (!linkData || linkData.access_level === 'download') return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: 'Action Restricted',
        description: 'Right-click is disabled for view-only documents',
        variant: 'destructive'
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [linkData, toast]);

  // Show loading immediately if no token is detected
  if (!token) {
    console.error('[ViewDocument] No token found in URL:', {
      pathname: window.location.pathname,
      search: window.location.search,
      isIOS
    });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground mb-6">
            No secure token found in the URL. Please check your link and try again.
          </p>
          {isIOS && (
            <p className="text-xs text-muted-foreground mb-4">
              iOS device detected. Try opening the link in Safari (not private mode) or copying and pasting the full URL.
            </p>
          )}
          <Button onClick={() => navigate('/app')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{authLoading ? 'Checking authentication...' : 'Loading document...'}</p>
          {isIOS && <p className="text-xs text-muted-foreground mt-2">iOS device detected</p>}
        </div>
      </div>
    );
  }

  if (error || !linkData) {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'This document is not available'}
          </p>
          {isIOS && (
            <p className="text-xs text-muted-foreground mb-4">
              iOS device detected. If you're having trouble accessing the document after login, 
              try using Safari in non-private mode or refresh the page.
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                console.log('[ViewDocument] Retry button clicked, clearing storage and reloading');
                localStorage.removeItem('authReturnUrl');
                sessionStorage.removeItem('authReturnUrl');
                window.location.reload();
              }} 
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (isIOS) {
                  window.location.href = '/app';
                } else {
                  navigate('/app');
                }
              }} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  console.log('[ViewDocument] Rendering checks:', {
    hasPassword: !!linkData.password_hash,
    passwordVerified,
    viewerData,
    hasViewerData: !!viewerData
  });

  // Check password protection
  if (linkData.password_hash && !passwordVerified) {
    console.log('[ViewDocument] Showing password protection');
    return (
      <PasswordProtection
        linkToken={token!}
        linkId={linkData.id}
        expectedHash={linkData.password_hash}
        onVerified={(data) => {
          console.log('[ViewDocument] Password verified, viewer data:', data);
          setViewerData(data);
          setPasswordVerified(true);
        }}
      />
    );
  }

  // Always collect viewer information if not already collected
  if (!viewerData) {
    console.log('[ViewDocument] Showing viewer info collection');
    return (
      <ViewerInfoCollection
        onSubmit={(data) => {
          console.log('[ViewDocument] Viewer info submitted:', data);
          setViewerData(data);
        }}
      />
    );
  }

  console.log('[ViewDocument] All checks passed, showing document');

  // Check NDA requirement
  if (linkData.nda_required && !ndaSigned && !linkData.nda_signed_at) {
    const documentName = linkData.document_id
      ? linkData.document.file_name
      : linkData.bundle?.name || linkData.folder?.name || 'Shared folder';

    return (
      <NDASignature
        linkId={linkData.id}
        documentName={documentName}
        onSigned={() => setNdaSigned(true)}
      />
    );
  }

  // Folder viewer
  if (linkData.folder_id) {
    const folderContents = (linkData as any).folder_contents;

    return (
      <FolderViewer
        token={token!}
        linkData={linkData}
        folderContents={folderContents}
        viewerData={viewerData}
      />
    );
  }

  // Render bundle viewer or single document viewer
  if (linkData.bundle_id) {
    const documents = linkData.bundle.bundle_documents || [];
    
    // If a specific document is selected, show only that document with a back button
    if (documentId) {
      const selectedDoc = documents.find((bd: any) => bd.document.id === documentId)?.document;
      
      if (!selectedDoc) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
              <p className="text-muted-foreground">Document not found</p>
              <Button 
                onClick={() => navigate(`/view/${token}`)} 
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bundle
              </Button>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          {/* Header with Back Button */}
          <div className="border-b bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/view/${token}`)}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm shrink-0">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-1.5 truncate">{selectedDoc.file_name}</h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                        <Lock className="w-3 h-3 md:w-4 md:h-4" />
                        {linkData.access_level === 'download' ? 'Download' : 'View Only'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 md:py-10 max-w-7xl overflow-hidden">
            <Card className="overflow-hidden border-2 shadow-xl h-[calc(100vh-80px)] sm:h-[calc(100vh-140px)]">
              <DocumentViewer
                documentUrl={selectedDoc.file_url}
                documentType={selectedDoc.file_type}
                accessLevel={linkData.access_level}
                watermarkEnabled={linkData.watermark_enabled}
                recipientEmail={linkData.recipient_email}
                linkId={linkData.id}
                documentId={selectedDoc.id}
                enableTracking={true}
                viewerName={viewerData?.name}
                viewerEmail={viewerData?.email}
              />
            </Card>
          </div>
        </div>
      );
    }

    // Show bundle gallery
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Enhanced Header */}
        <div className="border-b bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-start justify-between gap-3 md:gap-4">
              <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm shrink-0">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-1.5 truncate">{linkData.bundle.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                    </span>
                    <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                      <Lock className="w-3 h-3 md:w-4 md:h-4" />
                      {linkData.access_level === 'download' ? 'Download' : 'View Only'}
                    </span>
                    {linkData.expires_at && (
                      <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Expires </span>
                        {new Date(linkData.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Gallery Grid */}
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {documents.map((bundleDoc: any, index: number) => {
              const doc = bundleDoc.document;
              const isPdf = doc.file_type === 'application/pdf' || doc.file_name?.endsWith('.pdf');
              
              return (
                <Card 
                  key={doc.id}
                  className="group cursor-pointer overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl"
                  onClick={() => navigate(`/view/${token}?doc=${doc.id}`)}
                >
                  {/* Document Preview */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center overflow-hidden">
                    {isPdf ? (
                      <iframe
                        src={`${doc.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 w-full h-full pointer-events-none scale-110"
                        title={doc.file_name}
                      />
                    ) : (
                      <FileText className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/40" />
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="shadow-lg">
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    </div>

                    {/* Document Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-3 md:p-4 bg-card border-t">
                    <h3 className="font-semibold text-sm md:text-base mb-1 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </h3>
                    {doc.description && (
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Single document viewer
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <div className="border-b bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
              <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm shrink-0">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-1.5 truncate">{linkData.document.file_name}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Secure </span>Document
                  </span>
                  <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                    <Lock className="w-3 h-3 md:w-4 md:h-4" />
                    {linkData.access_level === 'download' ? 'Download' : 'View Only'}
                  </span>
                  {linkData.expires_at && (
                    <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Expires </span>
                      {new Date(linkData.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Container */}
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 md:py-10 max-w-7xl overflow-hidden">
        <Card className="overflow-hidden border-2 shadow-xl h-[calc(100dvh-80px)] md:h-[calc(100dvh-140px)]" style={{ height: 'calc(100vh - 140px)' }}>
          <DocumentViewer
            documentUrl={linkData.document.file_url}
            documentType={linkData.document.file_type}
            accessLevel={linkData.access_level}
            watermarkEnabled={linkData.watermark_enabled}
            recipientEmail={linkData.recipient_email}
            linkId={linkData.id}
            documentId={linkData.document.id}
            enableTracking={true}
            viewerName={viewerData?.name}
            viewerEmail={viewerData?.email}
          />
        </Card>
      </div>
    </div>
  );
}

// Helper functions for file categorization
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

// Folder viewer for shared folder links
interface FolderViewerProps {
  token: string;
  linkData: any;
  folderContents: {
    rootFolder: any;
    folders: any[];
    documents: any[];
  } | null;
  viewerData: { name: string; email: string } | null;
}

function FolderViewer({ token, linkData, folderContents, viewerData }: FolderViewerProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderContents?.rootFolder?.id ?? null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Collapsible file list state
  const [isFileListCollapsed, setIsFileListCollapsed] = useState(false);
  
  // Expanded folders state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set([folderContents?.rootFolder?.id ?? ''])
  );

  if (!folderContents || !folderContents.rootFolder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-muted-foreground mb-4">Folder contents are not available for this link.</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </Card>
      </div>
    );
  }

  const { rootFolder, folders, documents } = folderContents;
  const allFolders = [rootFolder, ...(folders || [])];

  const foldersByParent = new Map<string | null, any[]>();
  allFolders.forEach((folder) => {
    const parentId = folder.parent_folder_id || null;
    if (!foldersByParent.has(parentId)) {
      foldersByParent.set(parentId, []);
    }
    foldersByParent.get(parentId)!.push(folder);
  });

  const documentsByFolder = new Map<string, any[]>();
  (documents || []).forEach((doc) => {
    if (!doc.folder_id) return;
    if (!documentsByFolder.has(doc.folder_id)) {
      documentsByFolder.set(doc.folder_id, []);
    }
    documentsByFolder.get(doc.folder_id)!.push(doc);
  });

  // Helper to get all descendant folder IDs for a given folder
  const descendantMap = new Map<string, string[]>();
  const getDescendantFolderIds = (folderId: string): string[] => {
    if (descendantMap.has(folderId)) return descendantMap.get(folderId)!;

    const children = foldersByParent.get(folderId) || [];
    const childIds: string[] = [];

    for (const child of children) {
      childIds.push(child.id);
      const childDescendants = getDescendantFolderIds(child.id);
      childIds.push(...childDescendants);
    }

    const uniqueIds = Array.from(new Set(childIds));
    descendantMap.set(folderId, uniqueIds);
    return uniqueIds;
  };
  
  // Helper to get ancestor folder IDs
  const getAncestorFolderIds = (folderId: string): string[] => {
    const ancestors: string[] = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId);
      if (folder?.parent_folder_id) {
        ancestors.push(folder.parent_folder_id);
        currentId = folder.parent_folder_id;
      } else {
        break;
      }
    }
    
    return ancestors;
  };
  
  // Toggle folder expand/collapse
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
  
  // Auto-expand when selected folder changes
  useEffect(() => {
    if (selectedFolderId) {
      const ancestors = getAncestorFolderIds(selectedFolderId);
      setExpandedFolders(prev => {
        const next = new Set(prev);
        ancestors.forEach(id => next.add(id));
        next.add(selectedFolderId);
        return next;
      });
    }
  }, [selectedFolderId]);

  const currentFolderId = selectedFolderId || rootFolder.id;
  const currentFolderIds = [currentFolderId, ...getDescendantFolderIds(currentFolderId)];
  const allCurrentDocuments = currentFolderIds.flatMap((id) => documentsByFolder.get(id) || []);

  // Filter and sort documents
  const filteredDocuments = allCurrentDocuments
    .filter((doc) => {
      // Search filter
      if (searchQuery && !doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // File type filter
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
  }, [searchQuery, selectedFileType, sortBy, currentFolderId]);

  // Initialize selected document when folder or page changes
  useEffect(() => {
    if (paginatedDocuments.length > 0) {
      setSelectedDocument((prev) =>
        prev && paginatedDocuments.some((d) => d.id === prev.id)
          ? prev
          : paginatedDocuments[0]
      );
    } else if (filteredDocuments.length > 0) {
      setSelectedDocument(filteredDocuments[0]);
    } else {
      setSelectedDocument(null);
    }
  }, [currentFolderId, paginatedDocuments.length, filteredDocuments.length]);

  // Count documents by file type
  const fileTypeCounts = allCurrentDocuments.reduce((acc, doc) => {
    const category = getFileCategory(doc.file_type);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderFolderTree = (parentId: string, depth = 0) => {
    const children = (foldersByParent.get(parentId) || [])
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Alphabetical sort

    return children.map((folder) => {
      const isActive = folder.id === currentFolderId;
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
          {/* Tree line connector */}
          {depth > 0 && (
            <div 
              className="absolute left-2 top-0 bottom-0 w-px bg-border"
              style={{ left: `${(depth - 1) * 16 + 8}px` }}
            />
          )}
          
          <div 
            className={cn(
              "flex items-center gap-1 py-1.5 px-2 rounded-md transition-colors mb-0.5",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {/* Expand/Collapse Toggle */}
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
                className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4.5 flex-shrink-0" /> 
            )}
            
            {/* Folder Icon */}
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" />
            )}
            
            {/* Folder Name - Click to Select */}
            <button
              onClick={() => setSelectedFolderId(folder.id)}
              className="flex-1 text-left text-sm truncate"
            >
              {folder.name || 'Untitled'}
            </button>
            
            {/* Document Count Badge */}
            <span className="text-xs opacity-70 ml-auto flex-shrink-0">{docsInFolderCount}</span>
          </div>
          
          {/* Render Children (only if expanded) */}
          {hasChildren && isExpanded && (
            <div className="relative">
              {renderFolderTree(folder.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render folder select options with hierarchy for mobile
  const renderFolderSelectOptions = (parentId: string, depth: number): JSX.Element[] => {
    const children = (foldersByParent.get(parentId) || [])
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    return children.flatMap(folder => {
      const prefix = depth > 0 ? '—'.repeat(depth) + ' ' : '';
      const descendantIds = getDescendantFolderIds(folder.id);
      const allFolderIds = [folder.id, ...descendantIds];
      const docsCount = allFolderIds.reduce(
        (sum, id) => sum + (documentsByFolder.get(id)?.length || 0),
        0
      );
      
      return [
        <SelectItem key={folder.id} value={folder.id}>
          {prefix}{folder.name || 'Untitled'} ({docsCount})
        </SelectItem>,
        ...renderFolderSelectOptions(folder.id, depth + 1)
      ];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-1.5 truncate">{rootFolder.name || 'Shared Folder'}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  {(documents || []).length} {(documents || []).length === 1 ? 'document' : 'documents'}
                </span>
                <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                  <Lock className="w-3 h-3 md:w-4 md:h-4" />
                  {linkData.access_level === 'download' ? 'Download' : 'View Only'}
                </span>
                {linkData.expires_at && (
                  <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Expires </span>
                    {new Date(linkData.expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Folder tree - hidden on mobile, sidebar on desktop */}
          <div className="lg:w-64 lg:flex-shrink-0 hidden lg:block">
            <Card className="p-3 md:p-4 sticky top-24 max-h-[calc(100vh-120px)]">
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
                    onClick={() => setExpandedFolders(new Set(allFolders.map(f => f.id)))}
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
                    <ChevronRight className="w-3 h-3" />
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

          {/* Mobile folder selector */}
          <div className="lg:hidden">
            <Select value={currentFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                {renderFolderSelectOptions(rootFolder.id, 0)}
              </SelectContent>
            </Select>
          </div>

          {/* Documents list & viewer */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Document List Section */}
            <Card className={cn(
              "p-3 md:p-4 flex flex-col transition-all duration-300",
              isFileListCollapsed 
                ? "h-auto" 
                : "h-auto lg:max-h-[500px]"
            )}>
            {/* Collapsed Toggle Bar */}
            {isFileListCollapsed && selectedDocument && (
              <button
                onClick={() => setIsFileListCollapsed(false)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors mb-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const category = getFileCategory(selectedDocument.file_type);
                      const IconComponent = getFileIcon(category);
                      return <IconComponent className="w-4 h-4 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={selectedDocument.file_name}>
                      {selectedDocument.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filteredDocuments.length} {filteredDocuments.length === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
              </button>
            )}
            
            {/* Search and Filter Controls */}
            {!isFileListCollapsed && (
              <>
                <div className="space-y-3 md:space-y-4 mb-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                  </div>

                  {/* File Type Filters & Collapse Button */}
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {['all', 'pdf', 'image', 'video', 'audio', 'document', 'other'].map((type) => {
                        const count = type === 'all' ? allCurrentDocuments.length : (fileTypeCounts[type] || 0);
                        const isActive = selectedFileType === type;
                        
                        return (
                          <button
                            key={type}
                            onClick={() => setSelectedFileType(type)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {getFileCategoryLabel(type)} ({count})
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFileListCollapsed(true)}
                      className="text-xs"
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Collapse
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Document Count and Results Info */}
            {!isFileListCollapsed && (
              <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 border-b flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold">Documents</h2>
                <p className="text-xs text-muted-foreground">
                  {filteredDocuments.length === allCurrentDocuments.length 
                    ? `${filteredDocuments.length} ${filteredDocuments.length === 1 ? 'document' : 'documents'}`
                    : `${filteredDocuments.length} of ${allCurrentDocuments.length} documents`
                  }
                </p>
              </div>
              
              {/* Pagination Info */}
              {totalPages > 1 && (
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                )}
              </div>
            )}

            {/* Scrollable Document List */}
            {!isFileListCollapsed && (
              <div className="flex-1 overflow-y-auto">
              {/* Empty State */}
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
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
                </div>
              ) : (
                <>
                  {/* Document List - Compact for better viewing */}
                  <div className="space-y-2 pr-2">
                    {paginatedDocuments.map((doc: any) => {
                      const isActive = selectedDocument?.id === doc.id;
                      const category = getFileCategory(doc.file_type);
                      const IconComponent = getFileIcon(category);
                      const isImage = category === 'image';

                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsFileListCollapsed(true);
                          }}
                          className={`w-full text-left group rounded-lg border p-2.5 transition-all hover:shadow-md flex items-center gap-3 ${
                            isActive
                              ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          {/* Thumbnail or Icon */}
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted/60 flex-shrink-0 flex items-center justify-center">
                            {isImage && doc.file_url ? (
                              <img 
                                src={doc.file_url} 
                                alt={doc.file_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <IconComponent className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate mb-0.5" title={doc.file_name}>
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getFileCategoryLabel(category)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
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
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="text-muted-foreground px-1 text-xs">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                         <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
              </div>
            )}
          </Card>

          {/* Document Viewer */}
          <div className={cn(
            "transition-all duration-300",
            isFileListCollapsed 
              ? "h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-8rem)]" 
              : "h-[40dvh] lg:h-[calc(100dvh-8rem)]"
          )} style={{ 
            height: isFileListCollapsed 
              ? 'calc(100vh - 10rem)' 
              : 'calc(40vh)'
          }}>
            {selectedDocument ? (
              <Card className="overflow-hidden border-2 shadow-xl h-full">
                <DocumentViewer
                  documentUrl={selectedDocument.file_url}
                  documentType={selectedDocument.file_type}
                  accessLevel={linkData.access_level}
                  watermarkEnabled={linkData.watermark_enabled}
                  recipientEmail={linkData.recipient_email}
                  linkId={linkData.id}
                  documentId={selectedDocument.id}
                  enableTracking={true}
                  viewerName={viewerData?.name}
                  viewerEmail={viewerData?.email}
                />
              </Card>
            ) : (
              <Card className="p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a document to preview</p>
                </div>
              </Card>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

