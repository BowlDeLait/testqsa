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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    
    // Add request interceptor to include token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
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
    };
  }, [API_BASE_URL]);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔑 Tentative de connexion...', { username, baseURL: API_BASE_URL });
      
      const response = await axios.post('/api/auth/login', {
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
      const response = await axios.post('/api/auth/register', {
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