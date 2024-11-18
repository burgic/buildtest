
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { WorkflowProvider } from './context/WorkflowContext';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AdvisorDashboard from './pages/AdvisorDashboard';
import { ClientPortal } from './pages/ClientPortal';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AuthCallback from './pages/auth/callback';
// import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <WorkflowProvider>
            
              <AppLayout>
                <Routes>
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="auth/register" element = {<Register/>} />
                  <Route path="auth/callback" element = {<AuthCallback/> } />
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
                
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </AppLayout>
          
          </WorkflowProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;