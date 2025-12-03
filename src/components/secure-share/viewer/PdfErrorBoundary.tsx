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
  prevResetKey?: string | number;
}

export class PdfErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0, prevResetKey: props.resetKey };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    // If resetKey changed, check if we need to reset error state
    if (nextProps.resetKey !== prevState.prevResetKey) {
      if (prevState.hasError) {
        console.log('[PdfErrorBoundary] Resetting error state due to resetKey change');
        return { 
          hasError: false, 
          error: undefined, 
          errorCount: 0,
          prevResetKey: nextProps.resetKey 
        };
      }
      // Just update the prevResetKey for next comparison
      return { prevResetKey: nextProps.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[PdfErrorBoundary] Error caught:', error.message);
    
    const maxRetries = this.props.maxRetries ?? 3;
    const newErrorCount = this.state.errorCount + 1;
    
    this.setState({ errorCount: newErrorCount });
    
    // Only trigger native fallback after ALL retries exhausted
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
