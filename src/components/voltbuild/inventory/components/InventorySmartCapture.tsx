import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  X, 
  Upload, 
  Loader2, 
  RotateCcw, 
  Sparkles,
  Plus,
  Check,
  AlertTriangle,
  Sun,
  Focus,
  Layers
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInventoryAIAnalysis, AIAnalysisResult, MultiItemAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { InventoryAIResults } from './InventoryAIResults';
import { InventoryMultiItemResults } from './InventoryMultiItemResults';
import { cn } from '@/lib/utils';
import { getImageQuality, ImageQualityMetrics } from '@/utils/imageProcessing';

interface InventorySmartCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (result: AIAnalysisResult, imageUrl: string) => void;
  onMultipleResults?: (results: AIAnalysisResult[], imageUrl: string) => void;
  existingCategories?: string[];
}

type CaptureState = 'camera' | 'preview' | 'analyzing' | 'results' | 'multi-results';
type AnalysisStep = 'detecting' | 'identifying' | 'separating' | 'counting' | 'valuing' | 'complete';

const ANALYSIS_STEPS: { key: AnalysisStep; label: string }[] = [
  { key: 'detecting', label: 'Detecting items...' },
  { key: 'identifying', label: 'Identifying brand & model...' },
  { key: 'counting', label: 'Counting quantity...' },
  { key: 'valuing', label: 'Estimating market value...' },
  { key: 'complete', label: 'Analysis complete!' },
];

const MULTI_ANALYSIS_STEPS: { key: AnalysisStep; label: string }[] = [
  { key: 'detecting', label: 'Scanning image...' },
  { key: 'separating', label: 'Separating items...' },
  { key: 'identifying', label: 'Identifying each item...' },
  { key: 'valuing', label: 'Estimating values...' },
  { key: 'complete', label: 'Analysis complete!' },
];

const MAX_PHOTOS = 4;

export function InventorySmartCapture({
  open,
  onOpenChange,
  onResult,
  onMultipleResults,
  existingCategories = [],
}: InventorySmartCaptureProps) {
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<CaptureState>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<ImageQualityMetrics | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('detecting');
  const [multiItemMode, setMultiItemMode] = useState(false);
  
  const { analyzeImage, analyzeMultipleItems, isAnalyzing, analysisResult, multiItemResults, reset } = useInventoryAIAnalysis();

  // Start camera when dialog opens
  useEffect(() => {
    if (open && state === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  // Simulate analysis progress
  useEffect(() => {
    if (state === 'analyzing') {
      const steps = multiItemMode 
        ? MULTI_ANALYSIS_STEPS.slice(0, -1).map(s => s.key)
        : ANALYSIS_STEPS.slice(0, -1).map(s => s.key);
      let stepIndex = 0;
      
      const interval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setAnalysisStep(steps[stepIndex]);
        }
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [state, multiItemMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setQualityWarning(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 4096, min: 1920 },
          height: { ideal: 3072, min: 1080 },
          aspectRatio: { ideal: 4/3 }
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
    
    // Check image quality
    const quality = getImageQuality(canvas);
    
    if (quality.isBlurry || quality.isDark) {
      setQualityWarning(quality);
      // Still allow capture but show warning
    } else {
      setQualityWarning(null);
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.92); // Higher quality
    
    setCapturedImages(prev => [...prev, imageData]);
    setState('preview');
  }, [stream]);

  const handleAddAnotherPhoto = () => {
    setQualityWarning(null);
    setState('camera');
  };

  const handleRemovePhoto = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    if (capturedImages.length <= 1) {
      setState('camera');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    
    for (const file of Array.from(files)) {
      const imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(imageData);
    }
    
    stopCamera();
    setCapturedImages(prev => [...prev, ...newImages].slice(0, MAX_PHOTOS));
    setState('preview');
  };

  const handleAnalyze = async () => {
    if (capturedImages.length === 0) return;
    
    setState('analyzing');
    setAnalysisStep('detecting');
    stopCamera();
    
    if (multiItemMode) {
      const result = await analyzeMultipleItems(capturedImages, existingCategories);
      if (result) {
        setAnalysisStep('complete');
        setTimeout(() => setState('multi-results'), 300);
      } else {
        setState('camera');
        setCapturedImages([]);
        startCamera();
      }
    } else {
      const result = await analyzeImage(capturedImages, existingCategories);
      if (result) {
        setAnalysisStep('complete');
        setTimeout(() => setState('results'), 300);
      } else {
        setState('camera');
        setCapturedImages([]);
        startCamera();
      }
    }
  };

  const handleRetake = () => {
    reset();
    setCapturedImages([]);
    setQualityWarning(null);
    setState('camera');
    startCamera();
  };

  const handleAccept = () => {
    if (analysisResult && capturedImages.length > 0) {
      onResult(analysisResult, capturedImages[0]);
      handleClose();
    }
  };

  const handleMultiItemsAdd = (items: AIAnalysisResult[], imageUrl: string) => {
    if (onMultipleResults) {
      onMultipleResults(items, imageUrl);
    }
    handleClose();
  };

  const handleEditItem = (item: AIAnalysisResult, index: number) => {
    // For now, just accept the single item directly
    onResult(item, capturedImages[0]);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    reset();
    setCapturedImages([]);
    setQualityWarning(null);
    setState('camera');
    setAnalysisStep('detecting');
    setMultiItemMode(false);
    onOpenChange(false);
  };

  const getCurrentStepIndex = () => {
    const steps = multiItemMode ? MULTI_ANALYSIS_STEPS : ANALYSIS_STEPS;
    return steps.findIndex(s => s.key === analysisStep);
  };

  const currentSteps = multiItemMode ? MULTI_ANALYSIS_STEPS : ANALYSIS_STEPS;

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
              {capturedImages.length > 0 && state !== 'analyzing' && state !== 'results' && state !== 'multi-results' && (
                <span className="text-sm text-muted-foreground">
                  ({capturedImages.length}/{MAX_PHOTOS} photos)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(state === 'camera' || state === 'preview') && (
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="multi-mode" className="text-sm cursor-pointer">Multi</Label>
                  <Switch
                    id="multi-mode"
                    checked={multiItemMode}
                    onCheckedChange={setMultiItemMode}
                  />
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Capture Tips */}
          {state === 'camera' && !cameraError && (
            <div className="absolute top-16 left-0 right-0 z-10 text-center text-white text-sm bg-black/50 py-2 px-4">
              📸 Tips: Good lighting • Hold steady • Include labels/tags
            </div>
          )}

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
                        
                        {/* Quality Warning Overlay */}
                        {qualityWarning && (
                          <div className="absolute bottom-24 left-4 right-4 z-20">
                            <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                              {qualityWarning.isBlurry && (
                                <>
                                  <Focus className="w-4 h-4 flex-shrink-0" />
                                  <span>Image may be blurry. Hold steady.</span>
                                </>
                              )}
                              {qualityWarning.isDark && (
                                <>
                                  <Sun className="w-4 h-4 flex-shrink-0" />
                                  <span>Low light detected. Move to brighter area.</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Photo Thumbnails */}
                        {capturedImages.length > 0 && (
                          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                            {capturedImages.map((img, i) => (
                              <div 
                                key={i} 
                                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white relative"
                              >
                                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                            multiple
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
                        
                        {capturedImages.length > 0 ? (
                          <Button 
                            variant="default" 
                            size="lg" 
                            onClick={() => setState('preview')}
                          >
                            Done
                          </Button>
                        ) : (
                          <div className="w-12" />
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* Preview State - Review captured photos */}
              {state === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex-1 p-4 overflow-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {capturedImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => handleRemovePhoto(i)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Photo {i + 1}
                          </div>
                        </div>
                      ))}
                      
                      {capturedImages.length < MAX_PHOTOS && (
                        <button
                          onClick={handleAddAnotherPhoto}
                          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus className="w-8 h-8" />
                          <span className="text-sm">Add angle</span>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      {capturedImages.length === 1 
                        ? "Add more photos from different angles for better accuracy"
                        : `${capturedImages.length} photos ready for analysis`}
                    </p>
                  </div>
                  
                  <div className="p-4 border-t flex gap-3">
                    <Button variant="outline" onClick={handleRetake} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                    <Button onClick={handleAnalyze} className="flex-1">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
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
                  {/* Image thumbnails */}
                  <div className="flex gap-2 mb-6">
                    {capturedImages.slice(0, 3).map((img, i) => (
                      <div 
                        key={i} 
                        className="w-16 h-16 rounded-lg overflow-hidden opacity-50"
                      >
                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {capturedImages.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center opacity-50">
                        <span className="text-sm font-medium">+{capturedImages.length - 3}</span>
                      </div>
                    )}
                  </div>
                  
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                  
                  {/* Analysis Steps Progress */}
                  <div className="w-full max-w-xs space-y-3">
                    {currentSteps.slice(0, -1).map((step, index) => {
                      const currentIndex = getCurrentStepIndex();
                      const isComplete = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <div 
                          key={step.key}
                          className={cn(
                            "flex items-center gap-3 transition-all",
                            isComplete && "text-primary",
                            isCurrent && "text-foreground font-medium",
                            !isComplete && !isCurrent && "text-muted-foreground"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                            isComplete && "bg-primary text-primary-foreground",
                            isCurrent && "bg-primary/20 text-primary",
                            !isComplete && !isCurrent && "bg-muted"
                          )}>
                            {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                          </div>
                          <span className="text-sm">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
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
                    imageUrl={capturedImages[0]}
                    allImages={capturedImages}
                    onAccept={handleAccept}
                    onRetake={handleRetake}
                    existingCategories={existingCategories}
                  />
                </motion.div>
              )}

              {/* Multi-Item Results State */}
              {state === 'multi-results' && multiItemResults && (
                <motion.div
                  key="multi-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 overflow-auto"
                >
                  <InventoryMultiItemResults
                    results={multiItemResults}
                    imageUrl={capturedImages[0]}
                    onAddSelected={handleMultiItemsAdd}
                    onEditItem={handleEditItem}
                    onRetake={handleRetake}
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
