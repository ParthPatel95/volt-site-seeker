import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Clock, FileText, ArrowLeft, Image, Video, Music, File, Folder, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { PasswordProtection } from '@/components/secure-share/viewer/PasswordProtection';
import { NDASignature } from '@/components/secure-share/viewer/NDASignature';
import { DocumentViewer } from '@/components/secure-share/viewer/DocumentViewer';
import { ViewerInfoCollection } from '@/components/secure-share/viewer/ViewerInfoCollection';
import { FolderGalleryView } from '@/components/secure-share/viewer/FolderGalleryView';
import { FullScreenDocumentViewer } from '@/components/secure-share/viewer/FullScreenDocumentViewer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { getCachedUrls, cacheUrls, getCachedUrl, cacheUrl } from '@/utils/signedUrlCache';

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
  
  // Document request type for batch fetching
  interface DocRequest {
    storagePath: string;
    isVideo?: boolean;
    expiresIn?: number;
  }

  // Batch fetch signed URLs for multiple documents (Phase 1 optimization)
  const fetchSignedUrlsBatch = async (documents: DocRequest[]): Promise<Map<string, string>> => {
    const resultMap = new Map<string, string>();
    
    if (documents.length === 0) return resultMap;

    // Phase 2: Check cache first
    const { cached, uncached } = getCachedUrls(documents);
    
    // Add cached URLs to result
    cached.forEach((url, path) => {
      resultMap.set(path, url);
    });
    
    console.log(`[ViewDocument] URL Cache: ${cached.size} hits, ${uncached.length} misses`);
    
    // If all URLs are cached, return immediately
    if (uncached.length === 0) {
      console.log('[ViewDocument] All URLs served from cache!');
      return resultMap;
    }

    // Fetch uncached URLs in a single batch request
    try {
      const startTime = Date.now();
      
      // Find expiresIn for each uncached path from original documents array
      const pathsWithExpiry = uncached.map(item => {
        const original = documents.find(d => d.storagePath === item.storagePath);
        return {
          storagePath: item.storagePath,
          isVideo: item.isVideo || false,
          expiresIn: original?.expiresIn
        };
      });

      const { data, error } = await supabase.functions.invoke('get-signed-url', {
        body: { paths: pathsWithExpiry }
      });

      if (error) {
        console.error('[ViewDocument] Batch signed URL error:', error);
        return fetchSignedUrlsFallback(documents.filter(d => !cached.has(d.storagePath)), resultMap);
      }

      const duration = Date.now() - startTime;
      console.log(`[ViewDocument] Batch fetch: ${data?.totalSuccess}/${data?.totalRequested} URLs in ${duration}ms`);

      // Process batch results and cache them
      if (data?.signedUrls) {
        const urlsToCache: Array<{ storagePath: string; url: string; expiresIn: number; isVideo?: boolean }> = [];
        
        for (const result of data.signedUrls) {
          if (result.signedUrl) {
            resultMap.set(result.storagePath, result.signedUrl);
            urlsToCache.push({
              storagePath: result.storagePath,
              url: result.signedUrl,
              expiresIn: result.expiresIn,
              isVideo: result.isVideo
            });
          }
        }
        
        // Cache all successful URLs
        cacheUrls(urlsToCache);
      }

      return resultMap;
    } catch (err) {
      console.error('[ViewDocument] Batch request exception:', err);
      return fetchSignedUrlsFallback(documents.filter(d => !cached.has(d.storagePath)), resultMap);
    }
  };

  // Fallback to individual requests if batch fails
  const fetchSignedUrlsFallback = async (
    documents: DocRequest[],
    existingResults: Map<string, string>
  ): Promise<Map<string, string>> => {
    console.log('[ViewDocument] Falling back to individual URL requests');
    
    await Promise.all(
      documents.map(async (doc) => {
        const url = await fetchSignedUrlWithRetry(doc.storagePath, doc.expiresIn || 3600, doc.isVideo || false);
        if (url) {
          existingResults.set(doc.storagePath, url);
          cacheUrl(doc.storagePath, url, doc.expiresIn || 3600, doc.isVideo);
        }
      })
    );
    
    return existingResults;
  };

  // Helper function to fetch signed URL with retry logic and video optimization (kept for single doc compatibility)
  const fetchSignedUrlWithRetry = async (storagePath: string, expiresIn: number, isVideo = false, retries = 3): Promise<string | null> => {
    // Check cache first
    const cachedUrl = getCachedUrl(storagePath, isVideo);
    if (cachedUrl) {
      console.log(`[ViewDocument] Cache hit for: ${storagePath}`);
      return cachedUrl;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('get-signed-url', {
          body: { storagePath, expiresIn, isVideo }
        });

        if (error) {
          console.error(`[ViewDocument] Signed URL error (attempt ${attempt}):`, error);
          if (attempt === retries) return null;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        if (data?.signedUrl) {
          // Cache the URL
          cacheUrl(storagePath, data.signedUrl, data.expiresIn || expiresIn, isVideo);
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

        // Phase 1: Batch fetch all signed URLs in a single request
        const docsToFetch: DocRequest[] = folderDocs
          .filter((doc: any) => doc.storage_path)
          .map((doc: any) => {
            const isVideoFile = doc.file_type?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(doc.file_name);
            return {
              storagePath: doc.storage_path,
              isVideo: isVideoFile,
              expiresIn: isVideoFile ? 21600 : expirySeconds
            };
          });

        const signedUrlMap = await fetchSignedUrlsBatch(docsToFetch);
        
        // Apply signed URLs to documents
        for (const doc of folderDocs) {
          if (doc.storage_path) {
            const url = signedUrlMap.get(doc.storage_path);
            if (url) {
              doc.file_url = url;
            } else {
              console.error('[ViewDocument] Failed to get signed URL for:', doc.file_name);
            }
          }
        }

        // Filter out documents that failed to get signed URLs
        const validFolderDocs = folderDocs.filter((doc: any) => doc.file_url);
        if (validFolderDocs.length === 0) {
          throw new Error('No documents could be loaded - all signed URL requests failed');
        }
        folderContents.documents = validFolderDocs;
        console.log('[ViewDocument] Valid documents after filtering:', validFolderDocs.length, '/', folderDocs.length);

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

        // Phase 1: Batch fetch all signed URLs in a single request
        const bundleDocsToFetch: DocRequest[] = bundleDocs
          .filter((bundleDoc: any) => bundleDoc.document?.storage_path)
          .map((bundleDoc: any) => {
            const doc = bundleDoc.document;
            const isVideoFile = doc.file_type?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(doc.file_name);
            return {
              storagePath: doc.storage_path,
              isVideo: isVideoFile,
              expiresIn: isVideoFile ? 21600 : expirySeconds
            };
          });

        const bundleUrlMap = await fetchSignedUrlsBatch(bundleDocsToFetch);
        
        // Apply signed URLs to bundle documents
        for (const bundleDoc of bundleDocs) {
          const doc = bundleDoc.document;
          if (doc?.storage_path) {
            const url = bundleUrlMap.get(doc.storage_path);
            if (url) {
              doc.file_url = url;
            } else {
              console.error('[ViewDocument] Failed to get signed URL for bundle doc:', doc.file_name);
            }
          }
        }

        return link;
      } else if (link.document_id) {
        // This is a single document
        const storagePath = link.document.storage_path;
        
        if (!storagePath) {
          console.error('No storage path found for document:', link.document);
          throw new Error('Document storage path not found');
        }

        // Detect video files for optimized expiry
        const isVideoFile = link.document.file_type?.startsWith('video/') || 
          /\.(mp4|mov|avi|mkv|webm)$/i.test(link.document.file_name);
        
        // Videos get 6 hours expiry by default, others get 24 hours
        let expirySeconds = isVideoFile ? 21600 : 86400;
        
        if (link.expires_at) {
          const expiryTime = new Date(link.expires_at).getTime();
          const now = Date.now();
          const linkExpiry = Math.max(60, Math.floor((expiryTime - now) / 1000));
          // Use shorter of link expiry or default video/doc expiry
          expirySeconds = Math.min(expirySeconds, linkExpiry);
        }

        console.log('Creating signed URL for:', storagePath, 'isVideo:', isVideoFile, 'expiry:', expirySeconds);
        
        const signedUrl = await fetchSignedUrlWithRetry(storagePath, expirySeconds, isVideoFile);

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

      // Bundle document viewer - use FullScreenDocumentViewer for immersive experience
      const allBundleDocs = documents.map((bd: any) => bd.document);
      
      return (
        <FullScreenDocumentViewer
          document={selectedDoc}
          allDocuments={allBundleDocs}
          linkData={linkData}
          viewerData={viewerData}
          onBack={() => navigate(`/view/${token}`)}
          onDocumentChange={(doc) => navigate(`/view/${token}?doc=${doc.id}`)}
        />
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
              const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              
              return (
                <Card 
                  key={doc.id}
                  className="group cursor-pointer overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl"
                  onClick={() => navigate(`/view/${token}?doc=${doc.id}`)}
                >
                  {/* Document Preview */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center overflow-hidden">
                    {isPdf && !isMobileDevice ? (
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

  // Single document viewer - use FullScreenDocumentViewer for immersive experience
  return (
    <FullScreenDocumentViewer
      document={linkData.document}
      allDocuments={[linkData.document]}
      linkData={linkData}
      viewerData={viewerData}
      onBack={() => {
        // Try to close window, fallback to home
        if (window.opener || window.history.length > 1) {
          window.close();
        }
        navigate('/');
      }}
      onDocumentChange={() => {}} // No-op for single document
    />
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
  const [viewMode, setViewMode] = useState<'gallery' | 'viewer'>('gallery');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Search, filter, and pagination state - used by filtered documents
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  
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

  // Handle document selection - switch to full-screen viewer
  const handleDocumentSelect = (doc: any) => {
    // Save current scroll position
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop);
    }
    setSelectedDocument(doc);
    setViewMode('viewer');
  };

  // Handle back to gallery
  const handleBackToGallery = () => {
    setViewMode('gallery');
    
    // Restore scroll position after a brief delay for DOM updates
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollPosition;
      }
    }, 50);
  };

  // Full-screen document viewer
  if (viewMode === 'viewer' && selectedDocument) {
    return (
      <FullScreenDocumentViewer
        document={selectedDocument}
        allDocuments={filteredDocuments}
        linkData={linkData}
        viewerData={viewerData}
        onBack={handleBackToGallery}
        onDocumentChange={(doc) => {
          if (!doc || !doc.id) {
            console.error('[ViewDocument] Invalid document passed to onDocumentChange:', doc);
            return;
          }
          setSelectedDocument(doc);
        }}
      />
    );
  }

  // Gallery view
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
      <div ref={scrollContainerRef} className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl overflow-y-auto">
        <FolderGalleryView
          documents={documents || []}
          folders={folders || []}
          rootFolder={rootFolder}
          foldersByParent={foldersByParent}
          documentsByFolder={documentsByFolder}
          selectedFolderId={selectedFolderId || rootFolder.id}
          onFolderSelect={setSelectedFolderId}
          onDocumentSelect={handleDocumentSelect}
        />
      </div>
    </div>
  );
}

