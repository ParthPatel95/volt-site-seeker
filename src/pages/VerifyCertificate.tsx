import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle2, XCircle, ArrowLeft, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Cert {
  id: string;
  module_id: string;
  module_title: string;
  recipient_name: string;
  exam_score: number | null;
  issued_at: string;
}

const VerifyCertificate = () => {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<Cert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Verify Certificate | WattByte Academy';
    if (!certId) { setLoading(false); return; }
    supabase.from('academy_certificates').select('*').eq('id', certId).maybeSingle()
      .then(({ data }) => { setCert(data as any); setLoading(false); });
  }, [certId]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const linkedinUrl = cert
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : '#';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link to="/academy" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Academy
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {loading ? (
          <p className="text-muted-foreground">Verifying…</p>
        ) : !cert ? (
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Certificate Not Found</h1>
            <p className="text-muted-foreground">
              This certificate ID could not be verified. It may be invalid or revoked.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
            <div className="text-center space-y-2 mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Verified Certificate</p>
              <h1 className="text-2xl font-bold">WattByte Academy</h1>
            </div>

            <div className="border-t border-b border-border py-8 space-y-4 text-center">
              <p className="text-sm text-muted-foreground">This is to certify that</p>
              <p className="text-3xl font-bold text-foreground">{cert.recipient_name}</p>
              <p className="text-sm text-muted-foreground">has successfully completed the module</p>
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <p className="text-xl font-semibold text-primary">{cert.module_title}</p>
              </div>
              {cert.exam_score != null && (
                <p className="text-sm text-muted-foreground">Exam score: <span className="font-semibold text-foreground">{cert.exam_score}%</span></p>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
              <div>
                <p>Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-mono mt-1">ID: {cert.id}</p>
              </div>
              <Button asChild size="sm" className="gap-2">
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" /> Share on LinkedIn
                </a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyCertificate;
