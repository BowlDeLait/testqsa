import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal, Send, Download, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const RemoteShell = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [targetInfo, setTargetInfo] = useState(null);

  useEffect(() => {
    setTargetInfo({
      hostname: 'DESKTOP-ABC123',
      ip: '192.168.1.100',
      user: 'Admin'
    });

    // Simuler la connexion
    setTimeout(() => {
      setIsConnected(true);
      addToHistory('system', `Connexion établie avec ${targetInfo?.hostname || 'la cible'}`);
      addToHistory('system', `Microsoft Windows [Version 10.0.19042.746]`);
      addToHistory('system', `(c) 2020 Microsoft Corporation. Tous droits réservés.`);
      addToHistory('system', '');
    }, 1000);
  }, [targetId]);

  useEffect(() => {
    // Auto-scroll vers le bas
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const addToHistory = (type, content, command = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      type, // 'command', 'output', 'error', 'system'
      content,
      command,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, entry]);
  };

  const executeCommand = async (cmd) => {
    if (!cmd.trim() || !isConnected) return;

    // Ajouter la commande à l'historique
    const fullCommand = `C:\\Users\\${targetInfo?.user || 'User'}> ${cmd}`;
    addToHistory('command', fullCommand, cmd);
    
    // Ajouter à l'historique des commandes
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Simuler l'exécution de commandes
    setTimeout(() => {
      let output = '';
      const lowerCmd = cmd.toLowerCase().trim();

      switch (lowerCmd) {
        case 'dir':
        case 'ls':
          output = `Volume dans le lecteur C n'a pas de nom.
Le numéro de série du volume est 1234-5678

Répertoire de C:\\Users\\${targetInfo?.user || 'User'}

14/01/2024  10:30    <DIR>          .
14/01/2024  10:30    <DIR>          ..
12/01/2024  14:22    <DIR>          Desktop
13/01/2024  09:15    <DIR>          Documents
11/01/2024  16:45    <DIR>          Downloads
10/01/2024  11:30         1 024     example.txt
               1 fichier(s)              1 024 octets
               4 Rép(s)  25 123 456 789 octets libres`;
          break;

        case 'systeminfo':
          output = `Nom de l'hôte:                    ${targetInfo?.hostname || 'DESKTOP-ABC123'}
Nom du système d'exploitation:   Microsoft Windows 10 Pro
Version du système:               10.0.19042 N/A version 19042
Type du système:                  x64-based PC
Processeur(s):                    1 processeur(s) installé(s).
                                  [01]: Intel64 Family 6 Model 158 Stepping 10 GenuineIntel ~2801 MHz
Mémoire physique totale:          16 384 MB
Mémoire physique disponible:      8 192 MB`;
          break;

        case 'ipconfig':
          output = `Configuration IP de Windows

Carte Ethernet Ethernet :

   Statut du média. . . . . . . . . . . . : Média déconnecté
   
Carte réseau sans fil Wi-Fi :

   Adresse IPv4. . . . . . . . . . . . . .: ${targetInfo?.ip || '192.168.1.100'}
   Masque de sous-réseau. . . . . . . . . : 255.255.255.0
   Passerelle par défaut. . . . . . . . . : 192.168.1.1`;
          break;

        case 'tasklist':
          output = `Nom de l'image                 PID Nom de la session      Numéro de ses Utilisation de la mémoire
========================= ======== ================ =========== ========================
System Idle Process              0 Services                   0             24 K
System                           4 Services                   0            428 K
smss.exe                       340 Services                   0          1 128 K
csrss.exe                      424 Services                   0          4 692 K
winlogon.exe                   448 Services                   0          2 864 K
services.exe                   492 Services                   0          6 320 K
lsass.exe                      504 Services                   0         12 484 K
svchost.exe                    664 Services                   0          5 536 K
explorer.exe                  1234 Console                    1         25 648 K`;
          break;

        case 'whoami':
          output = `${targetInfo?.hostname || 'desktop-abc123'}\\${targetInfo?.user || 'admin'}`;
          break;

        case 'help':
          output = `Commandes disponibles:
dir, ls          - Liste le contenu du répertoire
cd <répertoire>  - Change de répertoire
systeminfo       - Informations système
ipconfig         - Configuration réseau
tasklist         - Liste des processus
whoami           - Utilisateur actuel
help             - Affiche cette aide
cls, clear       - Efface l'écran
exit             - Ferme la session`;
          break;

        case 'cls':
        case 'clear':
          setHistory([]);
          return;

        case 'exit':
          addToHistory('system', 'Session fermée par l\'utilisateur');
          setIsConnected(false);
          return;

        default:
          if (lowerCmd.startsWith('cd ')) {
            const path = cmd.substring(3).trim();
            if (path) {
              output = `Répertoire changé vers: ${path}`;
            } else {
              output = `C:\\Users\\${targetInfo?.user || 'User'}`;
            }
          } else {
            output = `'${cmd}' n'est pas reconnu en tant que commande interne ou externe, un programme exécutable ou un fichier de commandes.`;
            addToHistory('error', output);
            return;
          }
      }

      addToHistory('output', output);
    }, 200 + Math.random() * 800); // Délai aléatoire pour simulation réaliste
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command);
      setCommand('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (newIndex === commandHistory.length - 1 && historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  const downloadLogs = () => {
    const logs = history.map(entry => {
      const timestamp = entry.timestamp.toLocaleString('fr-FR');
      return `[${timestamp}] ${entry.type.toUpperCase()}: ${entry.content}`;
    }).join('\n');
    
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shell_logs_${targetId}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Logs téléchargés');
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Copié dans le presse-papiers');
    });
  };

  const renderHistoryEntry = (entry) => {
    let className = 'font-mono text-sm whitespace-pre-wrap ';
    let prefix = '';
    
    switch (entry.type) {
      case 'command':
        className += 'text-discord-blurple font-semibold';
        break;
      case 'output':
        className += 'text-discord-lighter';
        break;
      case 'error':
        className += 'text-discord-red';
        break;
      case 'system':
        className += 'text-discord-yellow';
        prefix = '# ';
        break;
    }
    
    return (
      <div key={entry.id} className="group relative">
        <div className={className}>
          {prefix}{entry.content}
        </div>
        {entry.type !== 'system' && (
          <button
            onClick={() => copyToClipboard(entry.content)}
            className="absolute right-2 top-1 opacity-0 group-hover:opacity-100 text-discord-light hover:text-white transition-opacity"
            title="Copier"
          >
            <Copy className="w-3 h-3" />
          </button>
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
              <Terminal className="w-6 h-6 mr-2 text-discord-blurple" />
              Terminal distant
            </h1>
            <p className="text-discord-light">
              {targetInfo ? `${targetInfo.hostname} (${targetInfo.ip})` : `Cible: ${targetId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className={isConnected ? 'status-online' : 'status-offline'}></div>
            <span className="text-discord-light">
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          
          <button
            onClick={downloadLogs}
            className="discord-button-secondary flex items-center space-x-2"
            disabled={history.length === 0}
          >
            <Download className="w-4 h-4" />
            <span>Logs</span>
          </button>
          
          <button
            onClick={clearTerminal}
            className="discord-button-secondary flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Effacer</span>
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="discord-card p-0 overflow-hidden">
        <div className="bg-discord-darkest border-b border-discord-gray-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-discord-red"></div>
            <div className="w-3 h-3 rounded-full bg-discord-yellow"></div>
            <div className="w-3 h-3 rounded-full bg-discord-green"></div>
          </div>
          <div className="text-sm text-discord-light">
            Shell - {targetInfo?.hostname || 'Remote Terminal'}
          </div>
          <div className="w-12"></div>
        </div>
        
        <div 
          ref={terminalRef}
          className="terminal h-96 overflow-y-auto"
        >
          {!isConnected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-green mx-auto mb-2"></div>
                <p className="text-discord-light text-sm">Connexion au terminal...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map(renderHistoryEntry)}
              
              {/* Input line */}
              <form onSubmit={handleSubmit} className="flex items-center">
                <span className="text-discord-green font-mono text-sm">
                  C:\Users\{targetInfo?.user || 'User'}&gt;&nbsp;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="terminal-input flex-1"
                  autoComplete="off"
                  autoFocus
                  disabled={!isConnected}
                />
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Quick Commands */}
      {isConnected && (
        <div className="discord-card">
          <h3 className="text-lg font-semibold text-white mb-4">Commandes rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { cmd: 'dir', label: 'Lister fichiers' },
              { cmd: 'systeminfo', label: 'Info système' },
              { cmd: 'ipconfig', label: 'Config réseau' },
              { cmd: 'tasklist', label: 'Processus' },
              { cmd: 'whoami', label: 'Utilisateur' },
              { cmd: 'netstat -an', label: 'Connexions' },
              { cmd: 'wmic process list', label: 'Processus détaillés' },
              { cmd: 'help', label: 'Aide' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => executeCommand(item.cmd)}
                className="discord-button-secondary text-xs p-2 text-left"
                title={item.cmd}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteShell;