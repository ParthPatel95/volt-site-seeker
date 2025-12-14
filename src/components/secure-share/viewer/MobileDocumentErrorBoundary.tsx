import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  documentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MobileDocumentErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxAutoRetries = 2;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Filter out transient scroll/resize errors
    const isTransientError = 
      error.message?.includes('ResizeObserver') ||
      error.message?.includes('scroll') ||
      error.message?.includes('touch');
    
    if (isTransientError) {
      console.warn('[MobileDocumentErrorBoundary] Ignoring transient error:', error.message);
      return { hasError: false };
    }
    
    console.error('[MobileDocumentErrorBoundary] Caught error:', error.message);
    return { hasError: true, error };
  }

  // Check if error is a transient network error that should auto-retry
  isTransientNetworkError(error: Error): boolean {
    const transientPatterns = [
      'network error',
      'failed to fetch',
      'load failed',
      'timeout',
      'net::err',
      'networkerror',
      'connection refused'
    ];
    const errorMsg = error.message?.toLowerCase() || '';
    return transientPatterns.some(pattern => errorMsg.includes(pattern));
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MobileDocumentErrorBoundary] Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Auto-retry for transient network errors
    if (this.isTransientNetworkError(error) && this.retryCount < this.maxAutoRetries) {
      console.log('[MobileDocumentErrorBoundary] Auto-retrying transient network error...');
      this.retryCount++;
      setTimeout(() => {
        if (this.state.hasError) {
          this.setState({ hasError: false, error: undefined });
          this.props.onRetry?.();
        }
      }, 1000 * this.retryCount); // Exponential backoff
    }
  }

  // Removed componentDidUpdate auto-retry - was causing infinite refresh loops on scroll

  handleRetry = () => {
    console.log('[MobileDocumentErrorBoundary] Manual retry...');
    this.retryCount = 0; // Reset retry count on manual retry
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Document Viewer Error</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {this.props.documentName 
              ? `Failed to load "${this.props.documentName}"`
              : 'Failed to load the document'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleRetry} variant="default" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
