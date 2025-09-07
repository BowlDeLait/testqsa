import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔥 Soumission du formulaire de connexion', { username: formData.username });
    setIsLoading(true);
    
    const result = await login(formData.username, formData.password);
    console.log('🔄 Résultat de la tentative de connexion:', result);
    
    if (result.success) {
      console.log('✅ Connexion réussie, navigation vers /dashboard');
      navigate('/dashboard');
    } else {
      console.log('❌ Échec de la connexion:', result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-discord-darkest via-discord-dark to-discord-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-discord-blurple rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quasar Web</h1>
          <p className="text-discord-light">Interface de gestion avancée</p>
        </div>

        {/* Login Form */}
        <div className="discord-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-discord-lighter mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="discord-input"
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-discord-lighter mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="discord-input pr-12"
                  placeholder="Entrez votre mot de passe"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-discord-light hover:text-discord-lighter"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full discord-button flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-discord-light">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-discord-blurple hover:text-discord-blurple-dark font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-discord-gray-900 rounded-lg p-4 border border-discord-gray-700">
            <Shield className="w-6 h-6 text-discord-green mx-auto mb-2" />
            <p className="text-sm text-discord-light">Sécurisé</p>
          </div>
          <div className="bg-discord-gray-900 rounded-lg p-4 border border-discord-gray-700">
            <Zap className="w-6 h-6 text-discord-yellow mx-auto mb-2" />
            <p className="text-sm text-discord-light">Rapide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;