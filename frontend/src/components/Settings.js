import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Key,
  Globe,
  Server
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [serverSettings, setServerSettings] = useState({
    defaultPort: '4782',
    maxConnections: '100',
    logLevel: 'info',
    enableEncryption: true,
    autoReconnect: true,
    connectionTimeout: '30',
    bufferSize: '8192'
  });

  const [uiSettings, setUiSettings] = useState({
    theme: 'dark',
    language: 'fr',
    notifications: true,
    soundEffects: true,
    autoRefresh: true,
    refreshInterval: '30',
    compactMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '1440',
    loginNotifications: true,
    ipWhitelist: '',
    maxLoginAttempts: '5',
    passwordPolicy: 'strong'
  });

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'server', name: 'Serveur', icon: Server },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'interface', name: 'Interface', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Ici on appellerait l'API pour mettre à jour le profil
    toast.success('Profil mis à jour avec succès');
  };

  const handleServerSettingsUpdate = () => {
    // Ici on appellerait l'API pour mettre à jour les paramètres serveur
    toast.success('Paramètres serveur mis à jour');
  };

  const handleSecuritySettingsUpdate = () => {
    // Ici on appellerait l'API pour mettre à jour les paramètres de sécurité
    toast.success('Paramètres de sécurité mis à jour');
  };

  const handleUISettingsUpdate = () => {
    // Ici on appellerait l'API pour mettre à jour les paramètres d'interface
    toast.success('Paramètres d\'interface mis à jour');
  };

  const exportData = () => {
    // Simuler l'export des données
    const data = {
      profile: profileData,
      server: serverSettings,
      ui: uiSettings,
      security: securitySettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quasar_settings_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Paramètres exportés');
  };

  const clearAllData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
      // Ici on appellerait l'API pour effacer toutes les données
      toast.success('Toutes les données ont été effacées');
    }
  };

  const SettingCard = ({ title, children, onSave = null }) => (
    <div className="discord-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onSave && (
          <button onClick={onSave} className="discord-button flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
        )}
      </div>
      {children}
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <SettingCard title="Informations personnelles" onSave={handleProfileUpdate}>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="discord-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="discord-input"
              />
            </div>
          </div>
        </form>
      </SettingCard>

      <SettingCard title="Changer le mot de passe">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={profileData.currentPassword}
                onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                className="discord-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-discord-light hover:text-discord-lighter"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                  className="discord-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-discord-light hover:text-discord-lighter"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                className="discord-input"
              />
            </div>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderServerTab = () => (
    <div className="space-y-6">
      <SettingCard title="Configuration du serveur" onSave={handleServerSettingsUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Port par défaut
            </label>
            <input
              type="number"
              value={serverSettings.defaultPort}
              onChange={(e) => setServerSettings({...serverSettings, defaultPort: e.target.value})}
              className="discord-input"
              min="1"
              max="65535"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Connexions maximales
            </label>
            <input
              type="number"
              value={serverSettings.maxConnections}
              onChange={(e) => setServerSettings({...serverSettings, maxConnections: e.target.value})}
              className="discord-input"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Niveau de log
            </label>
            <select
              value={serverSettings.logLevel}
              onChange={(e) => setServerSettings({...serverSettings, logLevel: e.target.value})}
              className="discord-input"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Timeout de connexion (s)
            </label>
            <input
              type="number"
              value={serverSettings.connectionTimeout}
              onChange={(e) => setServerSettings({...serverSettings, connectionTimeout: e.target.value})}
              className="discord-input"
              min="5"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={serverSettings.enableEncryption}
              onChange={(e) => setServerSettings({...serverSettings, enableEncryption: e.target.checked})}
              className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
            />
            <span className="text-discord-light">Activer le chiffrement</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={serverSettings.autoReconnect}
              onChange={(e) => setServerSettings({...serverSettings, autoReconnect: e.target.checked})}
              className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
            />
            <span className="text-discord-light">Reconnexion automatique</span>
          </label>
        </div>
      </SettingCard>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <SettingCard title="Paramètres de sécurité" onSave={handleSecuritySettingsUpdate}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Timeout de session (minutes)
              </label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                className="discord-input"
                min="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Tentatives de connexion max
              </label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})}
                className="discord-input"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Liste blanche IP (une par ligne)
            </label>
            <textarea
              value={securitySettings.ipWhitelist}
              onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
              className="discord-input h-24"
              placeholder="192.168.1.100&#10;10.0.0.1"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Authentification à deux facteurs</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={securitySettings.loginNotifications}
                onChange={(e) => setSecuritySettings({...securitySettings, loginNotifications: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Notifications de connexion</span>
            </label>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderInterfaceTab = () => (
    <div className="space-y-6">
      <SettingCard title="Paramètres d'interface" onSave={handleUISettingsUpdate}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Thème
              </label>
              <select
                value={uiSettings.theme}
                onChange={(e) => setUiSettings({...uiSettings, theme: e.target.value})}
                className="discord-input"
              >
                <option value="dark">Sombre (Discord)</option>
                <option value="light">Clair</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-discord-lighter mb-2">
                Langue
              </label>
              <select
                value={uiSettings.language}
                onChange={(e) => setUiSettings({...uiSettings, language: e.target.value})}
                className="discord-input"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-discord-lighter mb-2">
              Intervalle d'actualisation (secondes)
            </label>
            <input
              type="number"
              value={uiSettings.refreshInterval}
              onChange={(e) => setUiSettings({...uiSettings, refreshInterval: e.target.value})}
              className="discord-input"
              min="5"
              max="300"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={uiSettings.notifications}
                onChange={(e) => setUiSettings({...uiSettings, notifications: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Notifications</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={uiSettings.soundEffects}
                onChange={(e) => setUiSettings({...uiSettings, soundEffects: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Effets sonores</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={uiSettings.autoRefresh}
                onChange={(e) => setUiSettings({...uiSettings, autoRefresh: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Actualisation automatique</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={uiSettings.compactMode}
                onChange={(e) => setUiSettings({...uiSettings, compactMode: e.target.checked})}
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
              <span className="text-discord-light">Mode compact</span>
            </label>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <SettingCard title="Paramètres de notifications">
        <div className="space-y-4">
          <div className="text-sm text-discord-light mb-4">
            Configurez quand et comment vous souhaitez être notifié des événements.
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-discord-light">Nouvelle connexion de cible</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-discord-light">Déconnexion de cible</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-discord-light">Échec de commande</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-discord-light">Nouveau keylog détecté</span>
              <input
                type="checkbox"
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-discord-light">Erreurs système</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
              />
            </label>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'server': return renderServerTab();
      case 'security': return renderSecurityTab();
      case 'interface': return renderInterfaceTab();
      case 'notifications': return renderNotificationsTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-discord-blurple" />
            Paramètres
          </h1>
          <p className="text-discord-light">Configurez votre expérience Quasar Web</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportData}
            className="discord-button flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button
            onClick={clearAllData}
            className="bg-discord-red hover:bg-discord-red-dark text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tout effacer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="discord-card p-0">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-discord-blurple text-white'
                        : 'text-discord-light hover:bg-discord-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;