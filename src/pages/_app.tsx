// src/pages/_app.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { WorkflowProvider } from '../context/WorkflowContext';
import { AuthProvider } from '../context/AuthProvider';
import '../index.css';

function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkflowProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="container mx-auto px-4 py-8">
                <Component {...pageProps} />
              </div>
            </div>
          </BrowserRouter>
        </WorkflowProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
