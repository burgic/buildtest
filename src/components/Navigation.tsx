import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, Users, FileText, LogOut, ClipboardCheck } from 'lucide-react';
import { useAuth } from "../context/AuthProvider"

const Navigation: React.FC = () => {

  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect will be handled by AuthProvider
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-blue-600">FinanceFlow</h1>
            <div className="flex space-x-4">
              <NavLink to="/advisor" className={linkClass}>
                <Briefcase className="w-5 h-5" />
                <span>Advisor Dashboard</span>
              </NavLink>
              <NavLink to="/client" className={linkClass}>
                <Users className="w-5 h-5" />
                <span>Client Portal</span>
              </NavLink>
              <NavLink to="/reports" className={linkClass}>
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </NavLink>
              <div className="flex space-x-4">
              <NavLink to="/dashboard" className={linkClass}>
                <Briefcase className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/workflow" className={linkClass}>
                <ClipboardCheck className="w-5 h-5" />
                <span>Complete Profile</span>
              </NavLink>
              {/* ... other navigation items ... */}
            </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
          </div>
      </div>
    </nav>
  );
};

export default Navigation;