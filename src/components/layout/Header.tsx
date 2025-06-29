import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-teal-600">
                AI Coach
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};