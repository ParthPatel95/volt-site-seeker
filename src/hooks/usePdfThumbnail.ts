import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export function usePdfThumbnail(pdfUrl: string | null) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdfUrl) {
      setThumbnailUrl(null);
      return;
    }

    const generateThumbnail = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 0.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise;

        setThumbnailUrl(canvas.toDataURL());
      } catch (error) {
        console.error('Error generating PDF thumbnail:', error);
        setThumbnailUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [pdfUrl]);

  return { thumbnailUrl, loading };
}
