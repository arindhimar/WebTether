from supabase import create_client
import os
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class AuthModel:
    def __init__(self):
        self.supabase = supabase

    def create_auth(self, user_id, email, password):
        """
        Create new auth record with hashed password.
        """
        hashed_pass = generate_password_hash(password)
        data = {
            "user_id": user_id,
            "email": email,
            "pass": hashed_pass
        }
        return self.supabase.table("auth").insert(data).execute()

    def get_auth_by_email(self, email):
        """
        Fetch auth record by email.
        """
        res = self.supabase.table("auth").select("*").eq("email", email).execute()
        return res.data[0] if res.data else None
