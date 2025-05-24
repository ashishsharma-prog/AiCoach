import React from 'react';
import { Home, MessageSquare, BarChart, User, Settings, Calendar, PlusCircle, BookOpen } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { name: 'Chat Coach', icon: <MessageSquare size={20} />, path: '/chat' },
    { name: 'Progress', icon: <BarChart size={20} />, path: '/progress' },
    { name: 'My Plans', icon: <BookOpen size={20} />, path: '/plans' },
    { name: 'Schedule', icon: <Calendar size={20} />, path: '/schedule' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' }
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-teal-600">AI Coach</h1>
        </div>
        
        <div className="flex-1 py-4 px-3">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`mr-3 ${location.pathname === item.path ? 'text-teal-500' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            <PlusCircle size={18} className="mr-2" />
            <span>New Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;