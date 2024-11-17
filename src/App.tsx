
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { WorkflowProvider } from './context/WorkflowContext';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AdvisorDashboard from './pages/AdvisorDashboard';
import ClientPortal from './pages/ClientPortal';
import Login from './pages/auth/login';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WorkflowProvider>
            
              <AppLayout>
                <Routes>
                  <Route path="/auth/login" element={<Login />} />
                  <Route
                    path="/advisor/*"
                    element={
                      <ProtectedRoute requiredRole="advisor">
                        <AdvisorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/client/*"
                    element={
                      <ProtectedRoute requiredRole="client">
                        <ClientPortal />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </AppLayout>
          
          </WorkflowProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;