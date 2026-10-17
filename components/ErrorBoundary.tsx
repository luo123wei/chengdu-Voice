'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

// 浏览器自动翻译（Google 翻译）改写 DOM 后，React 移除节点时会抛出这类错误
const isDomMutationError = (error: Error) =>
  /removeChild|insertBefore|NotFoundError/i.test(error?.message || '');

class ErrorBoundary extends Component<Props, State> {
  retryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('Error Boundary caught error:', error);
    // 注意：不要重置 retryCount，否则会形成「崩溃 → 3 秒后重试 → 再崩溃」的死循环
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary componentDidCatch:', error, errorInfo);
    // 浏览器网页翻译（Google 翻译）会把文本节点包进 <font> 里，
    // 导致 React 更新 DOM 时抛出 removeChild/insertBefore 这类错误。
    // 这是确定性的 DOM 结构问题，自动重试必然再次失败，因此直接停在兜底页等用户手动刷新。
    if (isDomMutationError(error)) return;
    this.scheduleRetry();
  }

  scheduleRetry = () => {
    const { retryCount } = this.state;
    if (retryCount >= 3) return;

    this.retryTimeout = setTimeout(() => {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }));
    }, 3000);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.setState({ hasError: false, error: null, retryCount: 0 });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience.{' '}
              {this.state.error &&
                !isDomMutationError(this.state.error) &&
                this.state.retryCount < 3 && (
                  <span className="text-primary">Retrying in 3 seconds...</span>
                )}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>
            {this.state.error && (
              <p className="text-xs text-gray-400 mt-4 max-w-xs mx-auto break-all">
                {this.state.error.message}
              </p>
            )}
            {this.state.error && isDomMutationError(this.state.error) && (
              <p className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">
                If your browser is auto-translating this page, please turn the translation off and
                refresh.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;