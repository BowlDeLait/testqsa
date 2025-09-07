import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderOpen,
  File,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Home,
  HardDrive,
  Folder,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Search,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const FileManager = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('C:\\');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [targetInfo, setTargetInfo] = useState(null);

  useEffect(() => {
    setTargetInfo({
      hostname: 'DESKTOP-ABC123',
      ip: '192.168.1.100'
    });
    loadDirectory(currentPath);
  }, [targetId, currentPath]);

  const loadDirectory = async (path) => {
    setLoading(true);
    
    // Simuler le chargement des fichiers
    setTimeout(() => {
      const mockFiles = [
        {
          name: '..',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          isParent: true
        },
        {
          name: 'Documents',
          type: 'directory',
          size: 0,
          modified: '2024-01-15T10:30:00Z',
          items: 24
        },
        {
          name: 'Downloads',
          type: 'directory',
          size: 0,
          modified: '2024-01-10T14:20:00Z',
          items: 12
        },
        {
          name: 'Desktop',
          type: 'directory',
          size: 0,
          modified: '2024-01-12T09:15:00Z',
          items: 8
        },
        {
          name: 'example.txt',
          type: 'file',
          size: 1024,
          modified: '2024-01-14T16:45:00Z',
          extension: 'txt'
        },
        {
          name: 'image.jpg',
          type: 'file',
          size: 2048576,
          modified: '2024-01-13T11:30:00Z',
          extension: 'jpg'
        },
        {
          name: 'document.pdf',
          type: 'file',
          size: 524288,
          modified: '2024-01-11T13:22:00Z',
          extension: 'pdf'
        },
        {
          name: 'archive.zip',
          type: 'file',
          size: 10485760,
          modified: '2024-01-09T08:45:00Z',
          extension: 'zip'
        }
      ];
      
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
  };

  const getFileIcon = (file) => {
    if (file.type === 'directory') {
      return <Folder className="w-5 h-5 text-discord-blurple" />;
    }
    
    const ext = file.extension?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-5 h-5 text-green-400" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-5 h-5 text-red-400" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-yellow-400" />;
      default:
        return <File className="w-5 h-5 text-discord-light" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const handleFileClick = (file) => {
    if (file.isParent) {
      const parentPath = currentPath.split('\\').slice(0, -2).join('\\') + '\\';
      setCurrentPath(parentPath || 'C:\\');
    } else if (file.type === 'directory') {
      setCurrentPath(currentPath + file.name + '\\');
    } else {
      // Ouvrir le fichier ou afficher les détails
      toast.info(`Fichier sélectionné: ${file.name}`);
    }
  };

  const handleFileSelect = (file, isSelected) => {
    if (isSelected) {
      setSelectedFiles([...selectedFiles, file.name]);
    } else {
      setSelectedFiles(selectedFiles.filter(name => name !== file.name));
    }
  };

  const downloadFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error('Aucun fichier sélectionné');
      return;
    }
    toast.success(`Téléchargement de ${selectedFiles.length} fichier(s) démarré`);
  };

  const deleteFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error('Aucun fichier sélectionné');
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedFiles.length} fichier(s) ?`)) {
      toast.success(`${selectedFiles.length} fichier(s) supprimé(s)`);
      setSelectedFiles([]);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <FolderOpen className="w-6 h-6 mr-2 text-discord-blurple" />
              Gestionnaire de fichiers
            </h1>
            <p className="text-discord-light">
              {targetInfo ? `${targetInfo.hostname} (${targetInfo.ip})` : `Cible: ${targetId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedFiles.length > 0 && (
            <>
              <button
                onClick={downloadFiles}
                className="discord-button flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger ({selectedFiles.length})</span>
              </button>
              <button
                onClick={deleteFiles}
                className="bg-discord-red hover:bg-discord-red-dark text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => loadDirectory(currentPath)}
            className="discord-button-secondary p-2"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="discord-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPath('C:\\')}
              className="discord-button-secondary p-2"
              title="Racine"
            >
              <HardDrive className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1 text-discord-light">
              <span className="font-mono bg-discord-darkest px-3 py-1 rounded">
                {currentPath}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-discord-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="discord-input pl-10 w-64"
              />
            </div>
            
            <label className="discord-button cursor-pointer flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Uploader</span>
              <input type="file" multiple className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="discord-card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord-blurple mx-auto mb-4"></div>
              <p className="text-discord-light">Chargement des fichiers...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-discord-gray-600">
                  <th className="text-left py-3 px-2 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(files.filter(f => !f.isParent).map(f => f.name));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                      className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-discord-light font-medium">Nom</th>
                  <th className="text-left py-3 px-4 text-discord-light font-medium">Taille</th>
                  <th className="text-left py-3 px-4 text-discord-light font-medium">Modifié</th>
                  <th className="text-left py-3 px-4 text-discord-light font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr
                    key={index}
                    className="border-b border-discord-gray-700 hover:bg-discord-gray-700 transition-colors"
                  >
                    <td className="py-3 px-2">
                      {!file.isParent && (
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.name)}
                          onChange={(e) => handleFileSelect(file, e.target.checked)}
                          className="rounded bg-discord-gray-700 border-discord-gray-600 text-discord-blurple"
                        />
                      )}
                    </td>
                    <td
                      className="py-3 px-4 cursor-pointer"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <span className="text-white">{file.name}</span>
                        {file.type === 'directory' && file.items && (
                          <span className="text-xs text-discord-light">({file.items} éléments)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-discord-light">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-3 px-4 text-discord-light text-sm">
                      {formatDate(file.modified)}
                    </td>
                    <td className="py-3 px-4">
                      {!file.isParent && (
                        <button className="text-discord-light hover:text-white p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-discord-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Dossier vide</h3>
                <p className="text-discord-light">Aucun fichier trouvé dans ce répertoire</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="discord-card">
        <div className="flex items-center justify-between text-sm">
          <div className="text-discord-light">
            {filteredFiles.length} élément(s) | {selectedFiles.length} sélectionné(s)
          </div>
          <div className="text-discord-light">
            Libre: 250 GB | Total: 500 GB
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;