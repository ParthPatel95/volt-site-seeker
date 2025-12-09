import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Lock, User, Mail, FileText, AlertCircle, Globe, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export default function SharedAESOReport() {
  // Debug: Log on every render
  console.log('[SharedAESOReport] Component rendering at', new Date().toISOString());
  
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [componentError, setComponentError] = useState<Error | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth states
  const [requiresViewerInfo, setRequiresViewerInfo] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  // Form states
  const [viewerName, setViewerName] = useState('');
  const [viewerEmail, setViewerEmail] = useState('');
  const [password, setPassword] = useState('');

  // Report states
  const [report, setReport] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<any>(null);

  // Debug: Log on mount
  useEffect(() => {
    console.log('[SharedAESOReport] Component mounted with token:', token?.substring(0, 8) + '...');
    isMountedRef.current = true;
    return () => {
      console.log('[SharedAESOReport] Component unmounting');
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    checkAccess();
  }, [token]);

  const checkAccess = async () => {
    if (!token) {
      console.log('[SharedAESOReport] No token provided');
      if (isMountedRef.current) {
        setError('Invalid link');
        setLoading(false);
      }
      return;
    }

    console.log('[SharedAESOReport] Checking access for token:', token.substring(0, 8) + '...');

    try {
      const { data, error: apiError } = await supabase.functions.invoke('validate-aeso-share', {
        body: { token }
      });

      console.log('[SharedAESOReport] API response:', { data, apiError });

      if (!isMountedRef.current) {
        console.log('[SharedAESOReport] Component unmounted, skipping state update');
        return;
      }

      // Handle API error
      if (apiError) {
        console.error('[SharedAESOReport] API error:', apiError);
        setError(apiError.message || 'Failed to load report');
        setLoading(false);
        return;
      }

      // Handle null/undefined data
      if (!data) {
        console.error('[SharedAESOReport] No data returned from API');
        setError('Failed to load report - no response');
        setLoading(false);
        return;
      }

      // Check for viewer info requirement FIRST (before checking valid:false)
      if (data.requiresViewerInfo) {
        console.log('[SharedAESOReport] Viewer info required, showing form');
        setRequiresViewerInfo(true);
        setRequiresPassword(!!data.requiresPassword);
        setReportTitle(data.title || 'AESO Analysis Report');
        setLoading(false);
        return;
      }

      // Check for password requirement
      if (data.requiresPassword && !data.valid) {
        console.log('[SharedAESOReport] Password required, showing form');
        setRequiresPassword(true);
        setReportTitle(data.title || 'AESO Analysis Report');
        setLoading(false);
        return;
      }

      // Check for invalid/error response
      if (!data.valid) {
        console.log('[SharedAESOReport] Invalid response:', data.error);
        setError(data.error || 'Invalid or expired link');
        setLoading(false);
        return;
      }

      // Success - we have the report
      console.log('[SharedAESOReport] Access granted, loading report');
      setReport(data.report);
      setLoading(false);
    } catch (err: any) {
      console.error('[SharedAESOReport] Exception:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load report');
        setLoading(false);
      }
    }
  };

  const handleSubmitAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!viewerName.trim() || !viewerEmail.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter your name and email.",
        variant: "destructive"
      });
      return;
    }

    if (requiresPassword && !password) {
      toast({
        title: "Password Required",
        description: "Please enter the password.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    console.log('[SharedAESOReport] Submitting viewer info:', { viewerName, viewerEmail, hasPassword: !!password });

    try {
      const { data, error: apiError } = await supabase.functions.invoke('validate-aeso-share', {
        body: {
          token,
          viewerName: viewerName.trim(),
          viewerEmail: viewerEmail.trim(),
          password: requiresPassword ? password : undefined
        }
      });

      console.log('[SharedAESOReport] Submit response:', { data, apiError });

      if (!isMountedRef.current) return;

      if (apiError) throw apiError;

      if (!data?.valid) {
        if (data?.requiresPassword && data?.error === 'Incorrect password') {
          toast({
            title: "Incorrect Password",
            description: "Please check the password and try again.",
            variant: "destructive"
          });
          setSubmitting(false);
          return;
        }
        throw new Error(data?.error || 'Access denied');
      }

      console.log('[SharedAESOReport] Access granted after form submit');
      setReport(data.report);
      setRequiresViewerInfo(false);
      setRequiresPassword(false);
    } catch (err: any) {
      console.error('[SharedAESOReport] Submit error:', err);
      if (isMountedRef.current) {
        toast({
          title: "Access Failed",
          description: err.message || "Failed to access report.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const handleTranslate = async (langCode: string) => {
    if (langCode === 'en') {
      setTranslatedContent(null);
      setSelectedLanguage('en');
      return;
    }

    if (!report) return;

    setTranslating(true);
    setSelectedLanguage(langCode);

    try {
      // Extract text sections from report for translation
      const sections = [
        { key: 'title', text: report.title },
        { key: 'summary', text: `Analysis period: ${report.reportConfig?.timePeriod} days. Uptime target: ${report.reportConfig?.uptimePercentage}%. Transmission adder: $${report.reportConfig?.transmissionAdder}/MWh.` }
      ];

      const { data, error } = await supabase.functions.invoke('translate-aeso-report', {
        body: {
          reportId: report.id,
          targetLanguage: langCode,
          content: {
            title: report.title,
            sections
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        setTranslatedContent(data.translation);
        toast({
          title: "Translation Complete",
          description: `Report translated to ${data.translation.languageName}`,
        });
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      toast({
        title: "Translation Failed",
        description: "Could not translate the report.",
        variant: "destructive"
      });
      setSelectedLanguage('en');
    } finally {
      setTranslating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report?.reportHtml) {
      toast({
        title: "No Content",
        description: "Report content is not available for download.",
        variant: "destructive"
      });
      return;
    }

    let container: HTMLDivElement | null = null;
    
    try {
      const htmlContent = report.reportHtml;
      
      // Create container for rendering - use visibility:hidden instead of opacity:0
      // visibility:hidden keeps element in render tree for html2canvas capture
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1100px';
      container.style.height = 'auto';
      container.style.minHeight = '100vh';
      container.style.overflow = 'visible';
      container.style.background = 'white';
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
      
      // Force layout calculation and wait for render
      container.getBoundingClientRect();
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dynamic import html2pdf with error handling
      let html2pdf;
      try {
        const module = await import('html2pdf.js');
        html2pdf = module.default;
      } catch (importError) {
        console.error('[SharedAESOReport] Failed to load html2pdf:', importError);
        // Fallback: open HTML in new tab for manual printing
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast({
          title: "Opening Report",
          description: "Use your browser's Print > Save as PDF option.",
        });
        return;
      }
      
      // Generate PDF with settings optimized for CSS rendering
      const opt = {
        margin: 10,
        filename: `${report.title || 'AESO_Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 1100,
          width: 1100,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: 'avoid-all' }
      };
      
      await html2pdf().set(opt).from(container).save();

      toast({
        title: "PDF Downloaded",
        description: "Report has been downloaded.",
      });
    } catch (error) {
      console.error('[SharedAESOReport] PDF download error:', error);
      
      // Ultimate fallback - open in new tab
      if (report?.reportHtml) {
        const blob = new Blob([report.reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast({
          title: "Opening in Browser",
          description: "Use Print > Save as PDF to download.",
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Could not generate PDF.",
          variant: "destructive"
        });
      }
    } finally {
      // Always clean up
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  // Component-level error state
  if (componentError) {
    console.error('[SharedAESOReport] Component error:', componentError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Error Loading Report</CardTitle>
            <CardDescription>{componentError.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    console.log('[SharedAESOReport] Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Viewer info / password form
  if (requiresViewerInfo || requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{reportTitle}</CardTitle>
            <CardDescription>
              Please provide your information to access this report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={viewerName}
                  onChange={(e) => setViewerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={viewerEmail}
                  onChange={(e) => setViewerEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {requiresPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Access Report'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report viewer
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7931A] to-[#0A1628] flex items-center justify-center text-white font-bold">
              W
            </div>
            <div>
              <h1 className="font-semibold text-sm">
                {translatedContent?.title || report?.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                WattByte Energy Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Select value={selectedLanguage} onValueChange={handleTranslate}>
              <SelectTrigger className="w-[160px]">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Download Button */}
            {report?.reportHtml && (
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Translation Loading */}
      {translating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Translating report...</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="container mx-auto px-4 py-6">
        {report?.reportHtml ? (
          <div 
            className="bg-card rounded-lg shadow-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: report.reportHtml }}
          />
        ) : report ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                {translatedContent?.title || report?.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                Report type: {report?.reportType === 'comprehensive' ? 'Comprehensive (7 Scenarios)' : 'Single Scenario'}
              </p>
              <p className="text-sm text-muted-foreground">
                Analysis period: {report?.reportConfig?.timePeriod} days
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Report Not Available</h2>
              <p className="text-muted-foreground">The report content could not be loaded.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
