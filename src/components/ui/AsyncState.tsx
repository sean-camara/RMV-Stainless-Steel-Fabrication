import React from 'react';
import { PageLoader } from './Loading';

interface AsyncStateProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingText?: string;
}

/**
 * Simple wrapper to show loading and error states consistently.
 * Usage: <AsyncState loading={isLoading} error={errorMessage}>...content...</AsyncState>
 */
const AsyncState: React.FC<AsyncStateProps> = ({ loading, error, children, loadingText }) => {
  if (loading) return <PageLoader text={loadingText ?? 'Loading...'} />;
  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-md border border-red-200">
        <p>{error}</p>
      </div>
    );
  }
  return <>{children}</>;
};

export default AsyncState;
