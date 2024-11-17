// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'advisor' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const auth = useAuth();

  console.log('Protected route auth check:')

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!auth.user) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Add role checking if required
  if (requiredRole) {
    const userRole = auth.user.user_metadata?.role || 'client'; // Default to client if no role specified
    if (userRole !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md">
            <h3 className="font-bold">Unauthorized</h3>
            <p>You don't have permission to access this page.</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}