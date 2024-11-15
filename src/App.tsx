import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AdvisorDashboard from './pages/AdvisorDashboard';
import ClientPortal from './pages/ClientPortal';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/advisor" element={<AdvisorDashboard />} />
            <Route path="/client" element={<ClientPortal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/" element={<Navigate to="/advisor" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;