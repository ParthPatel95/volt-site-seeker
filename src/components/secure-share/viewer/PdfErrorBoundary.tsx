import React, { Component, ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onError?: () => void;
  maxRetries?: number;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorCount: number;
  prevResetKey?: string | number;
  isRetrying: boolean;
}

export class PdfErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorCount: 0, 
      prevResetKey: props.resetKey,
      isRetrying: false 
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    // If resetKey changed, reset error state
    if (nextProps.resetKey !== prevState.prevResetKey) {
      if (prevState.hasError || prevState.errorCount > 0) {
        console.log('[PdfErrorBoundary] Resetting error state due to resetKey change');
        return { 
          hasError: false, 
          error: undefined, 
          errorCount: 0,
          prevResetKey: nextProps.resetKey,
          isRetrying: false
        };
      }
      return { prevResetKey: nextProps.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const maxRetries = this.props.maxRetries ?? 3;
    const newErrorCount = this.state.errorCount + 1;
    
    console.error(`[PdfErrorBoundary] Error caught (attempt ${newErrorCount}/${maxRetries}):`, error.message);
    
    this.setState({ errorCount: newErrorCount });
    
    // If we haven't exhausted retries, auto-retry after a short delay
    if (newErrorCount < maxRetries) {
      console.log(`[PdfErrorBoundary] Auto-retrying in 500ms...`);
      this.setState({ isRetrying: true });
      
      this.retryTimeoutId = setTimeout(() => {
        console.log('[PdfErrorBoundary] Executing auto-retry');
        this.setState({ hasError: false, error: undefined, isRetrying: false });
      }, 500);
    } else {
      // All retries exhausted - trigger native fallback
      console.log(`[PdfErrorBoundary] Max retries (${maxRetries}) reached, triggering native viewer fallback`);
      this.props.onError?.();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isRetrying: false });
  };

  render() {
    const maxRetries = this.props.maxRetries ?? 3;
    
    // Show loading spinner during auto-retry (don't show error UI)
    if (this.state.isRetrying) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Retrying... (Attempt {this.state.errorCount}/{maxRetries})
          </p>
        </div>
      );
    }

    // Only show error UI after all retries exhausted
    if (this.state.hasError && this.state.errorCount >= maxRetries) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">PDF Viewer Error</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            The PDF viewer encountered repeated errors. Please use the native viewer.
          </p>
          <Button onClick={this.props.onError} variant="default">
            Use Native Viewer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
