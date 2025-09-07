import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Package,
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Clock,
  Terminal,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_targets: 0,
    active_targets: 0,
    total_payloads: 0,
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Actualiser les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="discord-card hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-discord-light truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-white">
                {loading ? '...' : value}
              </div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change > 0 ? 'text-discord-green' : 'text-discord-red'
                }`}>
                  {change > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className="text-sm text-discord-light mt-1">
                {subtitle}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (action) => {
      switch (action) {
        case 'command_sent':
          return <Terminal className="w-4 h-4 text-discord-blurple" />;
        case 'target_connected':
          return <CheckCircle className="w-4 h-4 text-discord-green" />;
        case 'target_disconnected':
          return <AlertTriangle className="w-4 h-4 text-discord-red" />;
        default:
          return <Activity className="w-4 h-4 text-discord-light" />;
      }
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR');
    };

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-discord-gray-700 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          {getActivityIcon(activity.action)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white">
            {activity.details?.command ? `Commande: ${activity.details.command}` : activity.action}
          </p>
          <p className="text-xs text-discord-light">
            {formatTime(activity.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-discord-blurple to-discord-blurple-dark rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.username} !
        </h1>
        <p className="text-discord-gray-100 opacity-90">
          Voici un aperçu de vos activités Quasar Web
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cibles Totales"
          value={stats.total_targets}
          icon={Target}
          color="bg-discord-blurple"
          subtitle="Nombre total de cibles"
        />
        <StatCard
          title="Cibles Actives"
          value={stats.active_targets}
          icon={Activity}
          color="bg-discord-green"
          subtitle="Connectées maintenant"
        />
        <StatCard
          title="Payloads Créés"
          value={stats.total_payloads}
          icon={Package}
          color="bg-discord-yellow"
          subtitle="Payloads générés"
        />
        <StatCard
          title="Taux de Réussite"
          value={stats.active_targets > 0 ? Math.round((stats.active_targets / stats.total_targets) * 100) + '%' : '0%'}
          icon={TrendingUp}
          color="bg-gradient-to-r from-discord-green to-green-400"
          subtitle="Connexions réussies"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Activity */}
          <div className="discord-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-discord-blurple" />
                Activités Récentes
              </h3>
              <button 
                onClick={() => navigate('/targets')}
                className="text-discord-blurple hover:text-discord-blurple-dark text-sm font-medium"
              >
                Voir tout
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3 p-3">
                    <div className="w-4 h-4 bg-discord-gray-600 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-discord-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-discord-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats.recent_activities.length > 0 ? (
              <div className="space-y-1">
                {stats.recent_activities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-discord-gray-500 mx-auto mb-3" />
                <p className="text-discord-light">Aucune activité récente</p>
                <p className="text-sm text-discord-gray-500 mt-1">
                  Commencez par créer votre premier payload
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-discord-yellow" />
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/payload-builder')}
                className="w-full discord-button flex items-center justify-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Créer Payload</span>
              </button>
              <button
                onClick={() => navigate('/targets')}
                className="w-full discord-button-secondary flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Gérer Cibles</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-discord-green" />
              État Système
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-discord-light">Serveur Web</span>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-sm text-discord-green">En ligne</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-discord-light">Base de données</span>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-sm text-discord-green">Connectée</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-discord-light">WebSocket</span>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-sm text-discord-green">Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;