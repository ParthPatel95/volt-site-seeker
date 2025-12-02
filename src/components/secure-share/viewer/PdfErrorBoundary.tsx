import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onError?: () => void;
  maxRetries?: number;
  resetKey?: string | number; // Triggers reset when changed
}

interface State {
  hasError: boolean;
  error?: Error;
  errorCount: number;
}

export class PdfErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKey changes (e.g., page changes after error)
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      console.log('[PdfErrorBoundary] Resetting error state due to resetKey change');
      this.setState({ hasError: false, error: undefined, errorCount: 0 });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PDF Viewer Error:', error, errorInfo);
    
    const maxRetries = this.props.maxRetries ?? 2;
    const newErrorCount = this.state.errorCount + 1;
    
    this.setState({ errorCount: newErrorCount });
    
    // Auto-fallback to native viewer after max retries
    if (newErrorCount >= maxRetries) {
      console.log(`[PdfErrorBoundary] Max retries (${maxRetries}) reached, triggering native viewer fallback`);
      this.props.onError?.();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const maxRetries = this.props.maxRetries ?? 2;
      const canRetry = this.state.errorCount < maxRetries;
      
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">PDF Viewer Error</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {canRetry 
              ? `The PDF viewer encountered an error. (Attempt ${this.state.errorCount}/${maxRetries})`
              : 'The PDF viewer encountered repeated errors. Please use the native viewer.'}
          </p>
          <div className="flex gap-2">
            {canRetry && (
              <Button onClick={this.handleRetry} variant="outline">
                Try Again
              </Button>
            )}
            <Button onClick={this.props.onError} variant="default">
              Use Native Viewer
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
