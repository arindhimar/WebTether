from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class WebsiteModel:
    def __init__(self):
        self.supabase = supabase

    def create_website(self, url, uid, category):
        data = {"url": url, "uid": uid, "category": category}
        return self.supabase.table("website").insert(data).execute()

    def get_all_websites(self):
        return self.supabase.table("website").select("*").execute()

    def get_website_by_id(self, wid):
        return self.supabase.table("website").select("*").eq("wid", wid).single().execute()

    def get_websites_excluding_user(self, uid):
        """Get all websites except those owned by the specified user"""
        return self.supabase.table("website").select("*").neq("uid", uid).execute()

    def update_website(self, wid, data):
        return self.supabase.table("website").update(data).eq("wid", wid).execute()

    def delete_website(self, wid):
        return self.supabase.table("website").delete().eq("wid", wid).execute()

    def get_available_sites_for_user(self, current_uid):
        """Get all websites that are not owned by the current user"""
        return self.supabase.table("website").select("*").neq("uid", current_uid).execute()