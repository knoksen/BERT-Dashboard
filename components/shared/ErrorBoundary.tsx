import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracking } from '../../utils/errorTracking';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Track error with error tracking service
    errorTracking.captureException(error, errorInfo, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
    });

    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center p-4">
          <div className="bg-dark-card border border-red-500/50 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                <p className="text-dark-text-secondary text-sm">
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Error Details:</h3>
                <div className="bg-gray-900 border border-dark-border rounded-lg p-4 overflow-auto max-h-40">
                  <code className="text-red-400 text-sm font-mono break-all">
                    {this.state.error.toString()}
                  </code>
                </div>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mb-6">
                <summary className="text-white font-semibold cursor-pointer hover:text-accent transition-colors">
                  Stack Trace (Development Only)
                </summary>
                <div className="bg-gray-900 border border-dark-border rounded-lg p-4 mt-2 overflow-auto max-h-60">
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-accent hover:bg-accent-hover text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-dark-border hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Reload Page
              </button>
            </div>

            <p className="text-dark-text-secondary text-sm text-center mt-6">
              If this problem persists, please try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
