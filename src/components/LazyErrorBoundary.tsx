import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically designed for lazy-loaded components
 * Provides a clean fallback UI and retry functionality
 */
export class LazyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`LazyErrorBoundary caught error in ${this.props.componentName || 'component'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="p-3 bg-destructive/10 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to load {this.props.componentName || 'section'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            There was an error loading this content. Please try again.
          </p>
          <Button 
            onClick={this.handleRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading spinner component for Suspense fallback
 */
export const SectionLoader = ({ message }: { message?: string }) => (
  <div className="flex flex-col justify-center items-center py-12 sm:py-16 md:py-20">
    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
  </div>
);

/**
 * Wrapper component that combines Suspense and ErrorBoundary for lazy components
 */
export const LazySection: React.FC<{
  children: ReactNode;
  componentName?: string;
  loadingMessage?: string;
}> = ({ children, componentName, loadingMessage }) => (
  <LazyErrorBoundary componentName={componentName}>
    <Suspense fallback={<SectionLoader message={loadingMessage} />}>
      {children}
    </Suspense>
  </LazyErrorBoundary>
);

export default LazyErrorBoundary;
