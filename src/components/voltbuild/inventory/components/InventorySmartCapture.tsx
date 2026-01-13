import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  X, 
  Upload, 
  Loader2, 
  RotateCcw, 
  Sparkles,
  ImageIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInventoryAIAnalysis, AIAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { InventoryAIResults } from './InventoryAIResults';
import { cn } from '@/lib/utils';

interface InventorySmartCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (result: AIAnalysisResult, imageUrl: string) => void;
  existingCategories?: string[];
}

type CaptureState = 'camera' | 'analyzing' | 'results';

export function InventorySmartCapture({
  open,
  onOpenChange,
  onResult,
  existingCategories = [],
}: InventorySmartCaptureProps) {
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<CaptureState>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const { analyzeImage, isAnalyzing, analysisResult, reset } = useInventoryAIAnalysis();

  // Start camera when dialog opens
  useEffect(() => {
    if (open && state === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImage(imageData);
    stopCamera();
    handleAnalyze(imageData);
  }, [stream]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      stopCamera();
      handleAnalyze(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (imageData: string) => {
    setState('analyzing');
    const result = await analyzeImage(imageData, existingCategories);
    if (result) {
      setState('results');
    } else {
      // Analysis failed, go back to camera
      setState('camera');
      setCapturedImage(null);
      startCamera();
    }
  };

  const handleRetake = () => {
    reset();
    setCapturedImage(null);
    setState('camera');
    startCamera();
  };

  const handleAccept = () => {
    if (analysisResult && capturedImage) {
      onResult(analysisResult, capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    reset();
    setCapturedImage(null);
    setState('camera');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden",
          isMobile 
            ? "h-[100dvh] w-full max-w-full rounded-none border-0" 
            : "sm:max-w-lg max-h-[90vh]"
        )}
      >
        <div className="relative h-full flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">Smart Scan</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Camera State */}
              {state === 'camera' && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {cameraError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">{cameraError}</p>
                      <Button onClick={startCamera} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 bg-black relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Viewfinder overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-8 border-2 border-white/30 rounded-lg" />
                          <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                          <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                          <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                          <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                        </div>
                      </div>
                      
                      {/* Capture Controls */}
                      <div className="p-6 flex items-center justify-center gap-6 bg-background">
                        <label>
                          <Button variant="outline" size="lg" asChild className="cursor-pointer">
                            <span>
                              <Upload className="w-5 h-5" />
                            </span>
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                        
                        <Button
                          size="lg"
                          className="h-16 w-16 rounded-full"
                          onClick={capturePhoto}
                        >
                          <Camera className="w-6 h-6" />
                        </Button>
                        
                        <div className="w-12" /> {/* Spacer for alignment */}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Analyzing State */}
              {state === 'analyzing' && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6"
                >
                  {capturedImage && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden mb-6 opacity-50">
                      <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium">Analyzing image...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Detecting items, counting quantity, and estimating value
                  </p>
                </motion.div>
              )}

              {/* Results State */}
              {state === 'results' && analysisResult && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 overflow-auto"
                >
                  <InventoryAIResults
                    result={analysisResult}
                    imageUrl={capturedImage || undefined}
                    onAccept={handleAccept}
                    onRetake={handleRetake}
                    existingCategories={existingCategories}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
