import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Clock, FileText, ArrowLeft } from 'lucide-react';
import { PasswordProtection } from '@/components/secure-share/viewer/PasswordProtection';
import { NDASignature } from '@/components/secure-share/viewer/NDASignature';
import { DocumentViewer } from '@/components/secure-share/viewer/DocumentViewer';
import { ViewerInfoCollection } from '@/components/secure-share/viewer/ViewerInfoCollection';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

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
  
  // iOS Safari fallback: Extract token directly from URL if useParams fails
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const fallbackToken = isIOS && !routeToken ? window.location.pathname.split('/').pop() : null;
  const token = routeToken || fallbackToken;
  
  console.log('[ViewDocument] Token extraction:', {
    isIOS,
    routeToken,
    fallbackToken,
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

            const { data: signedUrlData, error: signedUrlError } =
              await supabase.functions.invoke('get-signed-url', {
                body: {
                  storagePath: doc.storage_path,
                  expiresIn: expirySeconds,
                },
              });

            if (signedUrlError) {
              console.error('[ViewDocument] Signed URL error for doc:', doc.file_name, signedUrlError);
              return;
            }

            if (signedUrlData?.signedUrl) {
              doc.file_url = signedUrlData.signedUrl;
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

            const { data: signedUrlData, error: signedUrlError } =
              await supabase.functions.invoke('get-signed-url', {
                body: {
                  storagePath: doc.storage_path,
                  expiresIn: expirySeconds,
                },
              });

            if (signedUrlError) {
              console.error('[ViewDocument] Signed URL error for doc in bundle:', doc.file_name, signedUrlError);
              return;
            }

            if (signedUrlData?.signedUrl) {
              doc.file_url = signedUrlData.signedUrl;
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
        
        const { data: signedUrlData, error: signedUrlError } = await supabase.functions.invoke(
          'get-signed-url',
          {
            body: { 
              storagePath,
              expiresIn: expirySeconds 
            }
          }
        );

        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError);
          throw new Error(`Failed to generate access URL: ${signedUrlError.message}`);
        }

        if (signedUrlData?.signedUrl) {
          console.log('Signed URL created successfully');
          link.document.file_url = signedUrlData.signedUrl;
        } else {
          console.error('No signed URL returned');
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
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
            <Card className="overflow-hidden border-2 shadow-xl">
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
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
        <Card className="overflow-hidden border-2 shadow-xl">
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
  
  console.log('[FolderViewer] Folder contents loaded:', {
    rootFolder: rootFolder.name,
    rootFolderId: rootFolder.id,
    totalFolders: folders?.length || 0,
    totalDocuments: documents?.length || 0,
    documentFolderIds: documents?.map((d: any) => ({ name: d.file_name, folderId: d.folder_id })) || []
  });
  
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
    if (!doc.folder_id) {
      console.warn('[FolderViewer] Document without folder_id:', doc.file_name);
      return;
    }
    if (!documentsByFolder.has(doc.folder_id)) {
      documentsByFolder.set(doc.folder_id, []);
    }
    documentsByFolder.get(doc.folder_id)!.push(doc);
  });

  console.log('[FolderViewer] Documents organized by folder:', 
    Array.from(documentsByFolder.entries()).map(([folderId, docs]) => ({
      folderId,
      folderName: allFolders.find(f => f.id === folderId)?.name || 'Unknown',
      count: docs.length
    }))
  );

  const currentFolderId = selectedFolderId || rootFolder.id;
  const currentDocuments = documentsByFolder.get(currentFolderId) || [];
  
  console.log('[FolderViewer] Current selection:', {
    selectedFolderId,
    currentFolderId,
    currentDocumentsCount: currentDocuments.length,
    currentDocuments: currentDocuments.map((d: any) => d.file_name)
  });

  // Initialize selected document when folder changes
  useEffect(() => {
    if (currentDocuments.length > 0) {
      setSelectedDocument((prev) => prev && currentDocuments.some((d) => d.id === prev.id) ? prev : currentDocuments[0]);
    }
  }, [currentFolderId, JSON.stringify(currentDocuments)]);

  const renderFolderTree = (folderId: string | null, depth = 0) => {
    const children = foldersByParent.get(folderId) || [];

    return children.map((folder) => {
      const isActive = folder.id === currentFolderId;
      const docsInFolder = documentsByFolder.get(folder.id) || [];

      return (
        <div key={folder.id} className="mb-1">
          <button
            className={
              `w-full flex items-center justify-between text-left text-sm px-2 py-1.5 rounded-md transition-colors ` +
              (isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground')
            }
            style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}
            onClick={() => setSelectedFolderId(folder.id)}
          >
            <span className="truncate">{folder.name || 'Untitled folder'}</span>
            <span className="ml-2 text-xs opacity-80">{docsInFolder.length}</span>
          </button>
          {renderFolderTree(folder.id, depth + 1)}
        </div>
      );
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
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Folder tree */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Card className="p-3 md:p-4 h-full">
            <h2 className="text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Folder Structure
            </h2>
            <div className="space-y-1 max-h-[60vh] overflow-auto pr-1">
              {renderFolderTree(null)}
            </div>
          </Card>
        </div>

        {/* Documents list & viewer */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div>
                <h2 className="text-sm font-semibold">Documents in this folder</h2>
                <p className="text-xs text-muted-foreground">
                  {currentDocuments.length} {currentDocuments.length === 1 ? 'document' : 'documents'} in selected folder
                </p>
              </div>
            </div>

            {currentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No documents directly in this folder</p>
                <p className="text-xs text-muted-foreground">Select a subfolder from the left to view its documents</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {currentDocuments.map((doc: any) => {
                  const isActive = selectedDocument?.id === doc.id;
                  const isPdf = doc.file_type === 'application/pdf' || doc.file_name?.endsWith('.pdf');

                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={
                        'text-left group rounded-lg border p-3 md:p-4 transition-all ' +
                        (isActive
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-muted/40')
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-muted/60 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={doc.file_name}>
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isPdf ? 'PDF Document' : doc.file_type || 'File'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {selectedDocument && (
            <Card className="overflow-hidden border-2 shadow-xl">
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
          )}
        </div>
      </div>
    </div>
  );
}

