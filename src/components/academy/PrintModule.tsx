import React from 'react';
import { Printer, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PrintModuleProps {
  moduleTitle: string;
  contentRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const PrintModule: React.FC<PrintModuleProps> = ({
  moduleTitle,
  contentRef,
  className,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import('@/utils/pdfExport');
      
      // Get main content or use provided ref
      const element = contentRef?.current || document.querySelector('main');
      if (!element) return;

      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove interactive elements from clone
      const interactiveSelectors = [
        '[data-interactive="true"]',
        '.knowledge-check',
        '.quick-flashcard',
        '.progress-tracker',
        'button',
        'nav',
        'footer',
      ];
      
      interactiveSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Temporarily add clone to DOM for rendering
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      try {
        await exportToPDF(clone, {
          filename: `WattByte-${moduleTitle.replace(/\s+/g, '-')}.pdf`,
          margin: 15,
          orientation: 'portrait',
          format: 'letter',
          imageQuality: 0.95,
          scale: 2,
        });
      } finally {
        document.body.removeChild(clone);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2 print:hidden"
        aria-label={`Print ${moduleTitle}`}
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Print</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="gap-2 print:hidden"
        aria-label={`Export ${moduleTitle} as PDF`}
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">Export PDF</span>
      </Button>
    </div>
  );
};
