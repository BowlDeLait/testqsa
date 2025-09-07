import axios from 'axios';

// Configuration de l'API centralisée
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

console.log('🔧 Configuration API centralisée avec URL:', API_BASE_URL || 'URL relative (same origin)');

// Créer une instance axios dédiée pour l'API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    if (response.config.responseType !== 'blob') {
      console.log('📥 API Response:', response.status, response.config.url);
    } else {
      console.log('📦 API Blob Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };