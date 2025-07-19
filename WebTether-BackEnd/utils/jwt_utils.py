import os
import jwt
import datetime
import hashlib
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(raw_password, hashed_password):
    return hash_password(raw_password) == hashed_password

def generate_token(payload):
    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None