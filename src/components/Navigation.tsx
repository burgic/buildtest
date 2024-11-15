import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, Users, FileText } from 'lucide-react';

const Navigation: React.FC = () => {
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;