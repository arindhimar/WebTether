from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class UserModel:
    def __init__(self):
        self.supabase = supabase

    def create_user(self, name, isVisitor, secret_key):
        data = {"name": name, "isVisitor": isVisitor, "secret_key": secret_key}
        return self.supabase.table("users").insert(data).execute()

    def get_all_users(self):
        return self.supabase.table("users").select("*").execute()

    def get_user_by_id(self, user_id):
        return self.supabase.table("users").select("*").eq("id", user_id).single().execute()

    def update_user(self, user_id, data):
        allowed_fields = ['name', 'agent_url', 'secret_key', 'isVisitor']
        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
        return self.supabase.table("users").update(filtered_data).eq("id", user_id).execute()

    def delete_user(self, user_id):
        return self.supabase.table("users").delete().eq("id", user_id).execute()