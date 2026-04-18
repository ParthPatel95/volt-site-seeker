import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { Award, ArrowLeft, ExternalLink, Linkedin, Bookmark as BookmarkIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ACADEMY_CURRICULUM } from '@/constants/curriculum-data';
import { downloadCertificatePdf } from '@/lib/certificate-download';

interface Cert {
  id: string;
  module_id: string;
  module_title: string;
  exam_score: number | null;
  issued_at: string;
}

const MyCertificates = () => {
  const { user, isLoading } = useAcademyAuth();
  const navigate = useNavigate();
  const [certs, setCerts] = useState<Cert[]>([]);
  const { bookmarks } = useBookmarks();

  useEffect(() => { document.title = 'My Certificates & Saved | WattByte Academy'; }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('academy_certificates').select('*').eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => setCerts((data as any) || []));
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) { navigate('/academy/auth'); return null; }

  const moduleById = (id: string) => ACADEMY_CURRICULUM.find(m => m.id === id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/academy" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Academy
        </Link>
      </header>
      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">My Certificates</h1>
          </div>
          {certs.length === 0 ? (
            <p className="text-muted-foreground">Pass any module exam (70%+) to earn your first certificate.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {certs.map(c => {
                const verifyUrl = `${window.location.origin}/verify/${c.id}`;
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Certificate</p>
                        <p className="font-semibold text-foreground">{c.module_title}</p>
                        {c.exam_score != null && (
                          <p className="text-xs text-muted-foreground mt-1">Score: {c.exam_score}%</p>
                        )}
                      </div>
                      <Award className="w-6 h-6 text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issued {new Date(c.issued_at).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          const safe = (c.module_title || 'certificate').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          downloadCertificatePdf(c.id, `wattbyte-${safe}`);
                        }}
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <Link to={`/verify/${c.id}`}>
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-3.5 h-3.5" /> Share
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookmarkIcon className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Saved for Later</h2>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-muted-foreground">Click the Save button on any lesson to bookmark it.</p>
          ) : (
            <ul className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {bookmarks.map(b => {
                const m = moduleById(b.module_id);
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {b.label || m?.title || b.module_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m?.title}{b.section_id ? ` · #${b.section_id}` : ''}
                      </p>
                    </div>
                    {m && (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`${m.route}${b.section_id ? `#${b.section_id}` : ''}`}>Open</Link>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyCertificates;
