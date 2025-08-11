from supabase import create_client
import os
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class AuthModel:
    def __init__(self):
        self.supabase = supabase

    def create_auth(self, user_id: int, email: str, password: str) -> Dict[str, Any]:
        """
        Create new auth record
        """
        hashed_pass = generate_password_hash(password)
        
        data = {
            "user_id": user_id,
            "email": email,
            "pass": hashed_pass
        }
        
        response = self.supabase.table("auth").insert(data).execute()
        return response.data[0]

    def get_auth_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Fetch auth record by email with proper error handling
        """
        try:
            # First validate email input
            if not isinstance(email, str) or "@" not in email:
                return None
                
            # Execute query with full error handling
            response = (
                self.supabase.table("auth")
                .select("*")
                .eq("email", email)
                .maybe_single()
                .execute()
            )
            
            # Check if response exists and has data
            if not response or not hasattr(response, 'data'):
                return None
                
            return response.data if response.data else None
            
        except Exception as e:
            print(f"Error fetching auth record: {str(e)}")
            return None
    def validate_credentials(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Validate user credentials
        """
        auth_data = self.get_auth_by_email(email)
        if not auth_data or not check_password_hash(auth_data["pass"], password):
            return None
        return auth_data