import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">দুঃখিত! কিছু সমস্যা হয়েছে।</h2>
            <p className="text-slate-600 mb-6">
              অ্যাপ্লিকেশনটি লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              আবার চেষ্টা করুন
            </button>
            {(this as any).state.error && (
              <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-[10px] text-slate-500 overflow-auto max-h-40">
                {(this as any).state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
