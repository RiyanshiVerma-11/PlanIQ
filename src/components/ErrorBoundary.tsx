import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise React Error Boundary
 * Catches unhandled runtime exceptions within view subtrees, preventing full application crashes.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PlanIQ UI ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-zinc-950/80 p-8 text-center backdrop-blur-md shadow-2xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-100">
            {this.props.fallbackTitle || 'Component Encountered an Issue'}
          </h3>

          <p className="mt-2 max-w-md text-xs text-zinc-400 leading-relaxed">
            {this.state.error?.message ||
              'A runtime rendering error occurred in this workspace view. The rest of PlanIQ Studio remains fully operational.'}
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-semibold text-zinc-950 hover:brightness-110 active:scale-95 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Recover View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
