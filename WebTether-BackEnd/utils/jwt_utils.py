import os
import jwt
import datetime
import hashlib
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "default_secret_key")  # fallback for safety in dev

def hash_password(password: str) -> str:
    """
    Hash a plaintext password using SHA256.

    Args:
        password (str): The raw password string.

    Returns:
        str: SHA256 hash of the password.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(raw_password: str, hashed_password: str) -> bool:
    """
    Check if the provided raw password matches the hashed password.

    Args:
        raw_password (str): User's input password.
        hashed_password (str): Stored hashed password.

    Returns:
        bool: True if match, else False.
    """
    return hash_password(raw_password) == hashed_password

def generate_token(user_id: int, additional_payload: dict = None) -> str:
    """
    Generate a JWT token with a 24-hour expiration.
    
    Args:
        user_id: The user's unique identifier
        additional_payload: Any extra claims to include
        
    Returns:
        Encoded JWT token
    """
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    
    if additional_payload:
        payload.update(additional_payload)
        
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """
    Decode a JWT token and return its payload.

    Args:
        token (str): Encoded JWT token.

    Returns:
        dict | None: Decoded payload or None if invalid/expired.
    """
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print(decoded)
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
