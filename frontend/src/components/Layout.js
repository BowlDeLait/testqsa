import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Home,
  Package,
  Target,
  Monitor,
  FolderOpen,
  Terminal,
  Info,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Créer Payload', href: '/payload-builder', icon: Package },
    { name: 'Gestion Cibles', href: '/targets', icon: Target },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-discord-darkest">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-50"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 discord-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 bg-discord-darkest border-b border-discord-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Shield className="w-8 h-8 text-discord-blurple" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Quasar Web</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-discord-light hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-discord-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-discord-blurple rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-discord-light truncate">
                {user?.role || 'Utilisateur'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`discord-nav-item rounded-lg ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-discord-gray-700">
          <button
            onClick={handleLogout}
            className="discord-nav-item w-full rounded-lg text-discord-red hover:bg-discord-red hover:bg-opacity-10"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-discord-dark border-b border-discord-gray-700 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 text-discord-light hover:text-white lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex lg:ml-0">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold text-white">
                    {navigation.find(item => isActive(item.href))?.name || 'Quasar Web'}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-discord-light hover:text-white p-2 rounded-lg hover:bg-discord-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-discord-light">En ligne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;