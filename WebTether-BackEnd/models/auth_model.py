from supabase import create_client
import os
from dotenv import load_dotenv
from utils.jwt_utils import generate_token, decode_token

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class AuthModel:
    def __init__(self):
        self.supabase = supabase

    def create_auth(self, email, password, user_id=None):
        token_pass = generate_token({"password": password})
        data = {"email": email, "pass": token_pass, "user_id": user_id}
        return self.supabase.table("auth").insert(data).execute()

    def get_all_auths(self):
        return self.supabase.table("auth").select("*").execute()

    def get_auth_by_id(self, auth_id):
        return self.supabase.table("auth").select("*").eq("id", auth_id).single().execute()

    def update_auth(self, auth_id, data):
        if "pass" in data:
            data["pass"] = generate_token({"password": data["pass"]})
        return self.supabase.table("auth").update(data).eq("id", auth_id).execute()

    def delete_auth(self, auth_id):
        return self.supabase.table("auth").delete().eq("id", auth_id).execute()

    def sign_up(self, email, password, user_id):
        return self.create_auth(email, password, user_id)

    def sign_in(self, email, password):
        r = self.supabase.table("auth").select("*").eq("email", email).single().execute()
        row = r.data
        if not row:
            return {"status": "failed", "reason": "Email not found"}
        stored = row["pass"]
        decoded = decode_token(stored)
        if decoded and decoded.get("password") == password:
            return {"status": "success", "user": row}
        return {"status": "failed", "reason": "Invalid credentials"}
