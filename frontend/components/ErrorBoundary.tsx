import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch rendering errors and show a fallback UI.
 */
// Fix: Explicitly using React.Component to ensure TypeScript correctly recognizes inherited members like props and state.
export class ErrorBoundary extends React.Component<Props, State> {
  // Initialize state as a class property to ensure TypeScript correctly recognizes inherited members
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Now correctly recognized as inherited members of Component
    const { hasError, error } = this.state;
    // Fix: this.props is now correctly recognized via inheritance from React.Component
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] p-12 max-w-lg w-full shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-gray-900">Something went wrong</h2>
              <p className="text-gray-500 leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnostic Info</p>
              <p className="text-xs font-mono text-gray-600 line-clamp-3">
                {error?.message || "Unknown error"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.href = '/#/dashboard'}
                className="w-full py-5 bg-teal-600 text-white rounded-3xl font-bold shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <Home size={18} /> Back to Dashboard
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                <RefreshCw size={14} /> Refresh Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;