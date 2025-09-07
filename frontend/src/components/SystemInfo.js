import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
  Shield,
  Clock,
  User,
  Globe,
  RefreshCw
} from 'lucide-react';

const SystemInfo = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemInfo();
  }, [targetId]);

  const fetchSystemInfo = async () => {
    setLoading(true);
    
    // Simuler le chargement des informations système
    setTimeout(() => {
      setSystemInfo({
        general: {
          hostname: 'DESKTOP-ABC123',
          os: 'Microsoft Windows 10 Pro',
          version: '10.0.19042.746',
          architecture: 'x64',
          uptime: '2 jours, 14 heures, 32 minutes',
          lastBoot: '12/01/2024 08:15:23',
          timeZone: 'Paris, Madrid (heure standard)',
          user: 'Admin',
          domain: 'WORKGROUP'
        },
        hardware: {
          processor: 'Intel(R) Core(TM) i7-8700K CPU @ 3.70GHz',
          cores: 6,
          threads: 12,
          totalRAM: '16 384 MB',
          availableRAM: '8 192 MB',
          manufacturer: 'ASUS',
          model: 'ROG STRIX Z370-E GAMING',
          serialNumber: 'ABC123456789',
          bios: 'American Megatrends Inc. 2603'
        },
        storage: [
          {
            drive: 'C:',
            type: 'Fixe',
            fileSystem: 'NTFS',
            totalSize: '500 GB',
            freeSpace: '250 GB',
            usedSpace: '250 GB',
            usagePercent: 50
          },
          {
            drive: 'D:',
            type: 'Fixe',
            fileSystem: 'NTFS',
            totalSize: '1 TB',
            freeSpace: '750 GB',
            usedSpace: '250 GB',
            usagePercent: 25
          }
        ],
        network: [
          {
            name: 'Ethernet',
            type: 'Ethernet',
            status: 'Déconnecté',
            ip: '-',
            mac: '00:1B:44:11:3A:B7'
          },
          {
            name: 'Wi-Fi',
            type: 'Sans fil',
            status: 'Connecté',
            ip: '192.168.1.100',
            mac: '00:1B:44:11:3A:B8',
            gateway: '192.168.1.1',
            dns: '192.168.1.1, 8.8.8.8'
          }
        ],
        security: {
          antivirus: 'Windows Defender',
          antivirusStatus: 'Activé',
          firewall: 'Activé',
          lastUpdate: '13/01/2024 10:30:00',
          uac: 'Activé',
          bitlocker: 'Désactivé'
        },
        location: {
          country: 'France',
          region: 'Île-de-France',
          city: 'Paris',
          isp: 'Orange',
          timezone: 'Europe/Paris',
          coordinates: '48.8566, 2.3522'
        }
      });
      setLoading(false);
    }, 1500);
  };

  const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`discord-card ${className}`}>
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 text-discord-blurple mr-2" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon = null }) => (
    <div className="flex items-center justify-between py-2 border-b border-discord-gray-700 last:border-b-0">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4 text-discord-light" />}
        <span className="text-discord-light">{label}:</span>
      </div>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );

  const StorageBar = ({ drive }) => (
    <div className="p-3 bg-discord-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">Disque {drive.drive}</span>
        <span className="text-sm text-discord-light">{drive.usagePercent}% utilisé</span>
      </div>
      <div className="w-full bg-discord-gray-600 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${
            drive.usagePercent > 80 ? 'bg-discord-red' : 
            drive.usagePercent > 60 ? 'bg-discord-yellow' : 'bg-discord-green'
          }`}
          style={{ width: `${drive.usagePercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm text-discord-light">
        <span>{drive.freeSpace} libre</span>
        <span>{drive.totalSize} total</span>
      </div>
    </div>
  );

  const NetworkCard = ({ adapter }) => (
    <div className="p-3 bg-discord-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{adapter.name}</span>
        <span className={`text-sm px-2 py-1 rounded ${
          adapter.status === 'Connecté' ? 'bg-discord-green bg-opacity-20 text-discord-green' :
          'bg-discord-red bg-opacity-20 text-discord-red'
        }`}>
          {adapter.status}
        </span>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-discord-light">Type:</span>
          <span className="text-white">{adapter.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-discord-light">IP:</span>
          <span className="text-white">{adapter.ip}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-discord-light">MAC:</span>
          <span className="text-white font-mono text-xs">{adapter.mac}</span>
        </div>
        {adapter.gateway && (
          <div className="flex justify-between">
            <span className="text-discord-light">Passerelle:</span>
            <span className="text-white">{adapter.gateway}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
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
              <Info className="w-6 h-6 mr-2 text-discord-blurple" />
              Informations système
            </h1>
            <p className="text-discord-light">Cible: {targetId}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="discord-card animate-pulse">
              <div className="h-6 bg-discord-gray-600 rounded mb-4 w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-discord-gray-600 rounded"></div>
                <div className="h-4 bg-discord-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-discord-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              <Info className="w-6 h-6 mr-2 text-discord-blurple" />
              Informations système
            </h1>
            <p className="text-discord-light">
              {systemInfo?.general.hostname} ({systemInfo?.network.find(n => n.status === 'Connecté')?.ip})
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchSystemInfo}
          className="discord-button-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="discord-card text-center">
          <Monitor className="w-8 h-8 text-discord-blurple mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{systemInfo.general.os}</div>
          <div className="text-sm text-discord-light">Système d'exploitation</div>
        </div>
        <div className="discord-card text-center">
          <Cpu className="w-8 h-8 text-discord-green mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{systemInfo.hardware.cores} cœurs</div>
          <div className="text-sm text-discord-light">Processeur</div>
        </div>
        <div className="discord-card text-center">
          <HardDrive className="w-8 h-8 text-discord-yellow mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{systemInfo.hardware.totalRAM}</div>
          <div className="text-sm text-discord-light">Mémoire RAM</div>
        </div>
        <div className="discord-card text-center">
          <Clock className="w-8 h-8 text-discord-red mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{systemInfo.general.uptime.split(',')[0]}</div>
          <div className="text-sm text-discord-light">Temps de fonctionnement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Information */}
        <InfoCard title="Informations générales" icon={Info}>
          <div className="space-y-1">
            <InfoRow label="Nom d'hôte" value={systemInfo.general.hostname} />
            <InfoRow label="Système" value={systemInfo.general.os} />
            <InfoRow label="Version" value={systemInfo.general.version} />
            <InfoRow label="Architecture" value={systemInfo.general.architecture} />
            <InfoRow label="Utilisateur" value={systemInfo.general.user} />
            <InfoRow label="Domaine" value={systemInfo.general.domain} />
            <InfoRow label="Fuseau horaire" value={systemInfo.general.timeZone} />
            <InfoRow label="Dernier démarrage" value={systemInfo.general.lastBoot} />
          </div>
        </InfoCard>

        {/* Hardware Information */}
        <InfoCard title="Matériel" icon={Cpu}>
          <div className="space-y-1">
            <InfoRow label="Processeur" value={systemInfo.hardware.processor} />
            <InfoRow label="Cœurs/Threads" value={`${systemInfo.hardware.cores} / ${systemInfo.hardware.threads}`} />
            <InfoRow label="RAM totale" value={systemInfo.hardware.totalRAM} />
            <InfoRow label="RAM disponible" value={systemInfo.hardware.availableRAM} />
            <InfoRow label="Fabricant" value={systemInfo.hardware.manufacturer} />
            <InfoRow label="Modèle" value={systemInfo.hardware.model} />
            <InfoRow label="BIOS" value={systemInfo.hardware.bios} />
          </div>
        </InfoCard>

        {/* Storage Information */}
        <InfoCard title="Stockage" icon={HardDrive}>
          <div className="space-y-3">
            {systemInfo.storage.map((drive, index) => (
              <StorageBar key={index} drive={drive} />
            ))}
          </div>
        </InfoCard>

        {/* Network Information */}
        <InfoCard title="Réseau" icon={Wifi}>
          <div className="space-y-3">
            {systemInfo.network.map((adapter, index) => (
              <NetworkCard key={index} adapter={adapter} />
            ))}
          </div>
        </InfoCard>

        {/* Security Information */}
        <InfoCard title="Sécurité" icon={Shield}>
          <div className="space-y-1">
            <InfoRow label="Antivirus" value={`${systemInfo.security.antivirus} (${systemInfo.security.antivirusStatus})`} />
            <InfoRow label="Pare-feu" value={systemInfo.security.firewall} />
            <InfoRow label="UAC" value={systemInfo.security.uac} />
            <InfoRow label="BitLocker" value={systemInfo.security.bitlocker} />
            <InfoRow label="Dernière MAJ" value={systemInfo.security.lastUpdate} />
          </div>
        </InfoCard>

        {/* Location Information */}
        <InfoCard title="Localisation" icon={Globe}>
          <div className="space-y-1">
            <InfoRow label="Pays" value={systemInfo.location.country} />
            <InfoRow label="Région" value={systemInfo.location.region} />
            <InfoRow label="Ville" value={systemInfo.location.city} />
            <InfoRow label="FAI" value={systemInfo.location.isp} />
            <InfoRow label="Fuseau horaire" value={systemInfo.location.timezone} />
            <InfoRow label="Coordonnées" value={systemInfo.location.coordinates} />
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SystemInfo;