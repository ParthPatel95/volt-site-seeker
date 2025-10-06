import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Clock } from 'lucide-react';
import { PasswordProtection } from '@/components/secure-share/viewer/PasswordProtection';
import { NDASignature } from '@/components/secure-share/viewer/NDASignature';
import { DocumentViewer } from '@/components/secure-share/viewer/DocumentViewer';
import { useToast } from '@/hooks/use-toast';

export default function ViewDocument() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [viewStartTime] = useState(Date.now());
  const [viewerData, setViewerData] = useState<{ name: string; email: string } | null>(null);

  const { data: linkData, isLoading, error } = useQuery({
    queryKey: ['secure-link', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');

      const { data: link, error: linkError } = await supabase
        .from('secure_links')
        .select(`
          *,
          document:secure_documents(*)
        `)
        .eq('link_token', token)
        .single();

      if (linkError) throw linkError;

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

      // Get signed URL for the document since bucket is private
      // Calculate expiry time based on link expiration or default to 24 hours
      const storagePath = link.document.storage_path;
      let expirySeconds = 86400; // Default 24 hours
      
      if (link.expires_at) {
        const expiryTime = new Date(link.expires_at).getTime();
        const now = Date.now();
        expirySeconds = Math.max(60, Math.floor((expiryTime - now) / 1000)); // At least 60 seconds
      }

      const { data: signedUrlData } = await supabase.storage
        .from('secure-documents')
        .createSignedUrl(storagePath, expirySeconds);

      if (signedUrlData?.signedUrl) {
        link.document.file_url = signedUrlData.signedUrl;
      }

      return link;
    },
    retry: false
  });

  // Track activity on mount and when viewer data is provided
  useEffect(() => {
    if (!linkData) return;
    // Only track when password is not required OR when viewer data is collected
    if (!linkData.password_hash || viewerData) {
      const trackView = async () => {
        try {
          // Insert viewer activity (RLS allows public insert)
          await supabase
            .from('viewer_activity')
            .insert({
              link_id: linkData.id,
              document_id: linkData.document_id,
              viewer_name: viewerData?.name || null,
              viewer_email: viewerData?.email || null,
              viewer_ip: 'unknown',
              device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
              browser: navigator.userAgent.split(' ').pop(),
              opened_at: new Date().toISOString()
            });

          // Increment view count (RLS allows public update on this specific action)
          await supabase
            .from('secure_links')
            .update({ 
              current_views: (linkData.current_views || 0) + 1,
              last_accessed_at: new Date().toISOString()
            })
            .eq('id', linkData.id);
        } catch (error) {
          console.error('Failed to track activity:', error);
        }
      };

      trackView();

      // Track time spent on page
      return () => {
        const timeSpent = Math.floor((Date.now() - viewStartTime) / 1000);
        supabase
          .from('viewer_activity')
          .update({ 
            total_time_seconds: timeSpent,
            last_activity_at: new Date().toISOString()
          })
          .eq('link_id', linkData.id)
          .order('opened_at', { ascending: false })
          .limit(1);
      };
    }
  }, [linkData, viewStartTime, viewerData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !linkData) {
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
        </Card>
      </div>
    );
  }

  // Check password protection
  if (linkData.password_hash && !passwordVerified) {
    return (
      <PasswordProtection
        linkToken={token!}
        linkId={linkData.id}
        expectedHash={linkData.password_hash}
        onVerified={(data) => {
          setViewerData(data);
          setPasswordVerified(true);
        }}
      />
    );
  }

  // Check NDA requirement
  if (linkData.nda_required && !ndaSigned && !linkData.nda_signed_at) {
    return (
      <NDASignature
        linkId={linkData.id}
        documentName={linkData.document.file_name}
        onSigned={() => setNdaSigned(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">{linkData.document.file_name}</h1>
                <p className="text-sm text-muted-foreground">Secure Document Viewer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <DocumentViewer
        documentUrl={linkData.document.file_url}
        documentType={linkData.document.file_type}
        accessLevel={linkData.access_level}
        watermarkEnabled={linkData.watermark_enabled}
        recipientEmail={linkData.recipient_email}
      />
    </div>
  );
}
