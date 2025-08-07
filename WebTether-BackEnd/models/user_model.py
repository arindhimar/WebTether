# models/user_model.py

from supabase import create_client
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from utils.jwt_utils import generate_token,hash_password

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class UserModel:
    """
    UserModel handles all database interactions related to users,
    including creation, authentication, and retrieval.
    """

    def __init__(self):
        self.supabase = supabase

    def get_user_by_id(self, uid: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve user details by user ID.
        """
        result = self.supabase.table("users").select("*").eq("id", uid).maybe_single().execute()
        return result.data if result.data else None

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.supabase.from_("auth") \
                        .select("*") \
                        .eq("email", email) \
                        .maybe_single() \
                        .execute()
            
            return response.data if response.data else None
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def create_user(self, name: str, email: str, password: str, wallet_address: str) -> dict:
        """
        Create a new user in the database with hashed password.
        Returns a dictionary with user ID, email, and JWT token.
        """
        try:
            # Hash password first
            hashed_pw = hash_password(password)
            
            # Insert user data
            response = self.supabase.table("users").insert({
                "name": name,
                "email": email,
                "password": hashed_pw,
                "wallet_address": wallet_address
            }).execute()
            
            if not response.data:
                raise ValueError("User creation failed - no data returned")
                
            created_user = response.data[0]
            return {
                "user_id": created_user["id"],
                "email": created_user["email"],
                "token": generate_token({"user_id": created_user["id"]})
            }
            
        except Exception as e:
            print(f"User creation error: {str(e)}")
            raise  # Re-raise for the controller to handle
        
        
    def validate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Validate credentials and return user with JWT token.
        """
        auth_data = self.get_user_by_email(email)
        if not auth_data:
            return None

        if not check_password_hash(auth_data["pass"], password):
            return None

        token = generate_token(auth_data["user_id"])

        return {
            "email": email,
            "token": token,
            "user_id": auth_data["user_id"]
        }
