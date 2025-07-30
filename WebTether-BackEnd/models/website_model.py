from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class WebsiteModel:
    def __init__(self):
        self.supabase = supabase

    def create_website(self, url, uid, category=None, status=None):
        data = {
            "url": url,
            "uid": uid,
            "category": category,
            "status": status
        }
        return self.supabase.table("website").insert(data).execute()

    def get_all_websites(self):
        return self.supabase.table("website").select("*").execute()

    def get_website_by_id(self, wid):
        return self.supabase.table("website").select("*").eq("wid", wid).single().execute()

    def update_website(self, wid, data):
        return self.supabase.table("website").update(data).eq("wid", wid).execute()

    def delete_website(self, wid):
        return self.supabase.table("website").delete().eq("wid", wid).execute()
    def get_available_sites_for_user(self, uid):
        return self.supabase.table("website").select("*").neq("uid", uid).execute()