import React from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import Navigation from '../components/Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
}