# models/user_model.py
from supabase import create_client
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class UserModel:
    """
    Handles database operations for users table
    """
    def __init__(self):
        self.supabase = supabase

    def create_user(self, name: str, is_visitor: bool = False, 
                   secret_key: Optional[str] = None, 
                   agent_url: Optional[str] = None, 
                   wallet_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Create new user in users table
        """
        user_data = {
            "name": name,
            "isVisitor": is_visitor,
            "secret_key": secret_key,
            "agent_url": agent_url,
            "wallet_address": wallet_address
        }
        response = self.supabase.table("users").insert(user_data).execute()
        return response.data[0]

    def get_user_by_id(self, uid: int) -> Optional[Dict[str, Any]]:
        """Retrieve user details by user ID with proper error handling"""
        try:
            result = (
                self.supabase.table("users")
                .select("*")
                .eq("id", uid)
                .maybe_single()
                .execute()
            )
            
            if not result.data:
                print(f"No user found with ID: {uid}")
                return None
                
            return result.data
        except Exception as e:
            print(f"Error fetching user {uid}: {str(e)}")
            return None

    def get_all_users(self) -> list:
        """
        Retrieve all users
        """
        result = self.supabase.table("users").select("*").execute()
        return result.data

    def update_user(self, uid: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user by ID
        """
        response = self.supabase.table("users").update(update_data).eq("id", uid).execute()
        return response.data[0]

    def delete_user(self, uid: int):
        """
        Delete user by ID
        """
        self.supabase.table("users").delete().eq("id", uid).execute()