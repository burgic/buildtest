
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { WorkflowProvider } from './context/WorkflowContext';
import { WorkflowForms } from './components/workflow/WorkflowForms';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AdvisorDashboard from './pages/AdvisorDashboard';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import AuthCallback from './pages/auth/callback';
import Dashboard from './pages/Dashboard';
import FinancialProfile from './pages/FinancialProfile';
import FinancialForm from './components/client/FinancialFormComponent';

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
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
                  path="/financial-profile"
                  element={
                    <ProtectedRoute>
                      <FinancialForm />
                    </ProtectedRoute>
                  }
                />
                  
                  <Route
                  path="/workflow"
                  element={
                    <ProtectedRoute>
                      <WorkflowForms />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <FinancialProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="*" element={<Navigate to="/auth/login" replace />} />
              </Routes>
              </AppLayout>
          
          </WorkflowProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;