from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class UserModel:
    def __init__(self):
        self.supabase = supabase

    def create_user(self, name, is_visitor=False, secret_key=None):
        data = {"name": name, "isVisitor": is_visitor, "secret_key": secret_key}
        return self.supabase.table("users").insert(data).execute()

    def get_all_users(self):
        return self.supabase.table("users").select("*").execute()

    def get_user_by_id(self, user_id):
        return self.supabase.table("users").select("*").eq("id", user_id).single().execute()

    def update_user(self, user_id, data):
        return self.supabase.table("users").update(data).eq("id", user_id).execute()

    def delete_user(self, user_id):
        return self.supabase.table("users").delete().eq("id", user_id).execute()
