#!/usr/bin/env python3
"""
Script pour créer des utilisateurs directement dans la base de données
Usage: python create_user.py <username> <email> <password>
"""

import sys
import os
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
from datetime import datetime

# Configuration
MONGO_URL = "mongodb://localhost:27017/quasar_web"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(username, email, password):
    """Créer un utilisateur directement dans la base de données"""
    try:
        # Connexion à la base de données
        client = MongoClient(MONGO_URL)
        db = client.quasar_web
        
        # Vérifier si l'utilisateur existe déjà
        if db.users.find_one({"username": username}):
            print(f"❌ L'utilisateur '{username}' existe déjà!")
            return False
            
        if db.users.find_one({"email": email}):
            print(f"❌ L'email '{email}' existe déjà!")
            return False
        
        # Hasher le mot de passe
        hashed_password = pwd_context.hash(password)
        user_id = str(uuid.uuid4())
        
        # Créer l'utilisateur
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
        print(f"✅ Utilisateur '{username}' créé avec succès!")
        print(f"📧 Email: {email}")
        print(f"🆔 ID: {user_id}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_user.py <username> <email> <password>")
        print("Exemple: python create_user.py monnom mon@email.com monmotdepasse")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    print(f"🔨 Création de l'utilisateur '{username}'...")
    if create_user(username, email, password):
        print(f"🎉 Vous pouvez maintenant vous connecter avec:")
        print(f"   Nom d'utilisateur: {username}")
        print(f"   Mot de passe: {password}")
    else:
        print("❌ Échec de la création de l'utilisateur")