# models/website_model.py

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class WebsiteModel:
    def __init__(self):
        self.supabase = supabase

    def create_website(self, url, uid, category=None):
        """
        Create a website entry for a user
        """
        data = {
            "url": url,
            "uid": uid,
            "category": category
        }
        return self.supabase.table("website").insert(data).execute()

    def get_all_websites(self):
        """
        Fetch all websites
        """
        return self.supabase.table("website").select("*").execute()

    def get_website_by_id(self, wid):
        """
        Fetch website by ID
        """
        return self.supabase.table("website").select("*").eq("wid", wid).single().execute()

    def update_website(self, wid, update_data):
        """
        Update a website entry with given fields
        """
        return self.supabase.table("website").update(update_data).eq("wid", wid).execute()

    def delete_website(self, wid):
        """
        Delete website entry by ID
        """
        return self.supabase.table("website").delete().eq("wid", wid).execute()

    def get_available_sites_for_user(self, current_uid):
        """
        Fetch websites that are not owned by the given user (for pinging)
        """
        return self.supabase.table("website").select("*").neq("uid", current_uid).execute()
