import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex items-center px-2 py-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-teal-600">
                AI Coach
              </Link>
            </div>
            <nav className="hidden lg:ml-6 lg:flex lg:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/plans"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Plans
              </Link>
              <Link
                to="/progress"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Progress
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                <UserIcon size={16} className="text-teal-600" />
              </div>
              <span className="ml-2 text-sm text-gray-700">
                {user?.email || 'User'}
              </span>
              {user && (
                <button
                  onClick={() => { signOut(); navigate('/login'); }}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};