import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // BYPASS TEMPORAIRE DU LOGIN - UTILISATEUR FICTIF AUTO-CONNECTÉ
  const [user, setUser] = useState({
    id: "temp-user-bypass",
    username: "admin-bypass",
    email: "admin@quasar.local"
  });
  const [loading, setLoading] = useState(false); // Désactiver le loading par défaut

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '/api';

  // Create dedicated axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000
  });

  // Configure axios defaults and create global instance
  useEffect(() => {
    console.log('🔧 Configuration axios avec API_BASE_URL:', API_BASE_URL);
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.timeout = 60000; // 60 seconds timeout par défaut
    
    // Make api instance globally available
    window.apiInstance = api;
    
    // Add request interceptor to both axios instances
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log('📤 Envoi de requête axios global:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token ajouté à la requête');
        }
        return config;
      },
      (error) => {
        console.error('❌ Erreur intercepteur request:', error);
        return Promise.reject(error);
      }
    );

    // Add interceptor to dedicated api instance
    const apiRequestInterceptor = api.interceptors.request.use(
      (config) => {
        console.log('📤 Envoi de requête API instance:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token ajouté à la requête API');
        }
        return config;
      },
      (error) => {
        console.error('❌ Erreur intercepteur API request:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptors to both instances
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Skip logging for blob responses to avoid corrupting binary data
        if (response.config.responseType !== 'blob') {
          console.log('📥 Réponse reçue axios global:', response.status, response.config.url);
        } else {
          console.log('📦 Fichier blob reçu axios global:', response.status, response.config.url, `(${response.data.size} bytes)`);
        }
        return response;
      },
      (error) => {
        console.error('❌ Erreur intercepteur response:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          toast.error('Session expirée, veuillez vous reconnecter');
        }
        return Promise.reject(error);
      }
    );

    const apiResponseInterceptor = api.interceptors.response.use(
      (response) => {
        // Skip logging for blob responses to avoid corrupting binary data
        if (response.config.responseType !== 'blob') {
          console.log('📥 Réponse reçue API instance:', response.status, response.config.url);
        } else {
          console.log('📦 Fichier blob reçu API instance:', response.status, response.config.url, `(${response.data.size} bytes)`);
        }
        return response;
      },
      (error) => {
        console.error('❌ Erreur intercepteur API response:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          toast.error('Session expirée, veuillez vous reconnecter');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      api.interceptors.request.eject(apiRequestInterceptor);
      api.interceptors.response.eject(apiResponseInterceptor);
    };
  }, [API_BASE_URL]);

  // Simplifié - pas de vérification automatique au démarrage
  useEffect(() => {
    console.log('✅ AuthProvider initialisé, loading = false');
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔑 Tentative de connexion...', { username, baseURL: API_BASE_URL });
      
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      console.log('✅ Réponse du serveur:', response.data);
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      toast.success('Connexion réussie !');
      console.log('✅ Connexion réussie, utilisateur défini:', userData);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      const message = error.response?.data?.detail || error.message || 'Erreur de connexion';
      toast.error(`Erreur: ${message}`);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Tentative d\'inscription avec:', { username, email });
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
      });
      
      console.log('Réponse inscription:', response.data);
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      return { success: true };
    } catch (error) {
      console.error('Erreur inscription:', error);
      console.error('Détails erreur:', error.response?.data);
      const message = error.response?.data?.detail || error.message || 'Erreur d\'inscription';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};