import React, { useRef } from 'react';
import { Award, Download, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CompletionCertificateProps {
  moduleName: string;
  completedAt: string;
  userName?: string;
  onClose?: () => void;
  className?: string;
}

export const CompletionCertificate: React.FC<CompletionCertificateProps> = ({
  moduleName,
  completedAt,
  userName = 'Learner',
  onClose,
  className,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const certificateId = `WB-${Date.now().toString(36).toUpperCase()}`;
  const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      const { exportToPDF } = await import('@/utils/pdfExport');
      
      await exportToPDF(certificateRef.current, {
        filename: `WattByte-Certificate-${moduleName.replace(/\s+/g, '-')}.pdf`,
        margin: 0,
        orientation: 'landscape',
        format: 'letter',
        imageQuality: 0.98,
        scale: 2,
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'WattByte Academy Certificate',
      text: `I just completed ${moduleName} at WattByte Academy!`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(
        `🎓 I just completed ${moduleName} at WattByte Academy! ${window.location.origin}`
      );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative max-w-4xl w-full"
        >
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close certificate"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Certificate */}
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-amber-950/30 dark:via-background dark:to-amber-950/30 rounded-2xl p-8 md:p-12 border-4 border-amber-400/50 shadow-2xl"
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-400/50 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-400/50 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-400/50 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-400/50 rounded-br-xl" />

            <div className="text-center space-y-6">
              {/* Logo/Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg"
              >
                <Award className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-sm uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 font-medium mb-2">
                  Certificate of Completion
                </h2>
                <h1
                  id="certificate-title"
                  className="text-3xl md:text-4xl font-bold text-foreground"
                >
                  WattByte Academy
                </h1>
              </div>

              {/* Recipient */}
              <div className="py-4">
                <p className="text-muted-foreground mb-2">This certifies that</p>
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  {userName}
                </p>
              </div>

              {/* Achievement */}
              <div className="py-4 border-t border-b border-amber-200 dark:border-amber-800/50">
                <p className="text-muted-foreground mb-2">has successfully completed</p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {moduleName}
                </p>
              </div>

              {/* Date and ID */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Completed:</span> {formattedDate}
                </div>
                <div>
                  <span className="font-medium">Certificate ID:</span> {certificateId}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={handleDownload}
              className="gap-2 bg-primary text-white hover:bg-primary/90"
              aria-label="Download certificate as PDF"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="gap-2 bg-white text-foreground border-border hover:bg-muted"
              aria-label="Share certificate"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
