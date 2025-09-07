import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, ArrowLeft, Maximize, Minimize, RefreshCw, Settings, Mouse, Keyboard } from 'lucide-react';

const RemoteDesktop = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [targetInfo, setTargetInfo] = useState(null);

  useEffect(() => {
    // Simuler le chargement des informations de la cible
    setTargetInfo({
      hostname: 'DESKTOP-ABC123',
      ip: '192.168.1.100',
      resolution: '1920x1080'
    });
    
    // Simuler la connexion au bureau distant
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      initializeCanvas();
    }, 2000);

    return () => clearTimeout(timer);
  }, [targetId]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Simuler un écran de bureau
    ctx.fillStyle = '#2F3136';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simuler une barre des tâches
    ctx.fillStyle = '#202225';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    
    // Simuler quelques icônes
    ctx.fillStyle = '#5865F2';
    ctx.fillRect(10, canvas.height - 35, 30, 30);
    ctx.fillRect(50, canvas.height - 35, 30, 30);
    
    // Texte de démonstration
    ctx.fillStyle = '#DCDDDE';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Bureau distant simulé', canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Cible: ${targetInfo?.hostname}`, canvas.width / 2, canvas.height / 2 + 30);
  };

  const handleMouseClick = (e) => {
    if (!isConnected) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ici on enverrait les coordonnées du clic au serveur
    console.log(`Clic à: ${x}, ${y}`);
  };

  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!isFullscreen) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const refreshScreen = () => {
    if (isConnected) {
      initializeCanvas();
    }
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
              <Monitor className="w-6 h-6 mr-2 text-discord-blurple" />
              Bureau distant
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
          
          {isConnected && (
            <>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="discord-input text-sm py-1 px-2"
              >
                <option value="low">Basse qualité</option>
                <option value="medium">Qualité moyenne</option>
                <option value="high">Haute qualité</option>
              </select>
              
              <button
                onClick={refreshScreen}
                className="discord-button-secondary p-2"
                title="Actualiser l'écran"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="discord-button-secondary p-2"
                title="Plein écran"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Remote Desktop Viewer */}
      <div className="discord-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
              <p className="text-discord-light">Connexion au bureau distant...</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleMouseClick}
              className="w-full border border-discord-gray-600 rounded cursor-crosshair"
              style={{ maxHeight: '70vh' }}
            />
            
            {isConnected && (
              <div className="absolute top-2 right-2 bg-discord-darkest bg-opacity-80 rounded-lg p-2">
                <div className="flex items-center space-x-2 text-xs text-discord-light">
                  <Mouse className="w-3 h-3" />
                  <span>Souris active</span>
                  <Keyboard className="w-3 h-3 ml-2" />
                  <span>Clavier actif</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-3">Contrôles système</h3>
            <div className="space-y-2">
              <button className="w-full discord-button-secondary text-sm py-2">
                Ctrl + Alt + Suppr
              </button>
              <button className="w-full discord-button-secondary text-sm py-2">
                Verrouiller la session
              </button>
              <button className="w-full discord-button-secondary text-sm py-2">
                Redémarrer
              </button>
            </div>
          </div>

          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-discord-light">Résolution:</span>
                <span className="text-white">{targetInfo?.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-discord-light">Qualité:</span>
                <span className="text-white capitalize">{quality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-discord-light">Latence:</span>
                <span className="text-discord-green">42ms</span>
              </div>
            </div>
          </div>

          <div className="discord-card">
            <h3 className="text-lg font-semibold text-white mb-3">Options</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple" />
                <span className="text-discord-light text-sm">Capture audio</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple" />
                <span className="text-discord-light text-sm">Partage presse-papiers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple" />
                <span className="text-discord-light text-sm">Transfert de fichiers</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteDesktop;