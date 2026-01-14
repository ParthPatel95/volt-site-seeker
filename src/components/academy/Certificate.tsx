import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Calendar, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CertificateProps {
  userName: string;
  courseName: string;
  completionDate: Date;
  tracks?: string[];
  certificateId?: string;
  onClose?: () => void;
  className?: string;
}

export default function Certificate({
  userName,
  courseName,
  completionDate,
  tracks = [],
  certificateId,
  onClose,
  className = '',
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const { exportToPDF } = await import('@/utils/pdfExport');
      
      await exportToPDF(certificateRef.current, {
        filename: `${userName.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`,
        margin: 0,
        orientation: 'landscape',
        format: 'letter',
        imageQuality: 0.98,
        scale: 2,
        useCORS: true,
      });
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
      console.error(error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${courseName} Certificate`,
      text: `I completed the ${courseName} program! 🎓`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(
        `I completed the ${courseName} program! 🎓 ${window.location.href}`
      );
      toast.success('Share link copied to clipboard');
    }
  };

  const generatedId = certificateId || `CERT-${Date.now().toString(36).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-4xl w-full">
        {/* Certificate Card */}
        <div
          ref={certificateRef}
          className="bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/30 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          {/* Decorative Border */}
          <div className="border-4 border-primary/20 rounded-2xl p-6 md:p-10 relative">
            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Award className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-wide">
                CERTIFICATE OF COMPLETION
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
            </div>

            {/* Body */}
            <div className="text-center space-y-6 mb-8">
              <p className="text-muted-foreground">This certifies that</p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">
                {userName}
              </h2>
              <p className="text-muted-foreground">has successfully completed</p>
              <h3 className="text-2xl md:text-3xl font-bold text-primary">
                {courseName}
              </h3>

              {/* Tracks Completed */}
              {tracks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {tracks.map((track, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {track}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 md:mb-0">
                <Calendar className="w-4 h-4" />
                <span>{format(completionDate, 'MMMM d, yyyy')}</span>
              </div>
              
              <div className="text-center">
                <div className="w-40 border-t border-foreground/30 pt-2">
                  <span className="text-sm text-muted-foreground">Program Director</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 md:mt-0">
                <span className="font-mono text-xs">{generatedId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Hook for managing certificate state
export function useCertificate() {
  const checkEligibility = (completedTracks: string[], totalTracks: number, quizScore: number) => {
    const trackCompletion = completedTracks.length / totalTracks;
    return trackCompletion >= 0.8 && quizScore >= 80;
  };

  const generateCertificateId = (userId: string, courseId: string) => {
    const timestamp = Date.now().toString(36);
    const userHash = userId.slice(0, 4);
    const courseHash = courseId.slice(0, 4);
    return `CERT-${timestamp}-${userHash}-${courseHash}`.toUpperCase();
  };

  return {
    checkEligibility,
    generateCertificateId,
  };
}
