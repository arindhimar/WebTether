from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class WebsiteModel:
    def __init__(self):
        self.supabase = supabase

    def create_website(self, url: str, uid: int, category: Optional[str] = None) -> Dict[str, Any]:
        """Create a website entry for a user"""
        data = {
            "url": url,
            "uid": uid,
            "category": category
        }
        response = self.supabase.table("website").insert(data).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        raise Exception("Website creation failed")

    def get_all_websites(self) -> List[Dict[str, Any]]:
        """Fetch all websites"""
        response = self.supabase.table("website").select("*").execute()
        return response.data

    def get_website_by_id(self, wid: int) -> Optional[Dict[str, Any]]:
        """Fetch website by ID"""
        response = self.supabase.table("website").select("*").eq("wid", wid).maybe_single().execute()
        return response.data

    def update_website(self, wid: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a website entry"""
        response = self.supabase.table("website").update(update_data).eq("wid", wid).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        raise Exception("Website not found or update failed")

    def delete_website(self, wid: int) -> None:
        """Delete website by ID"""
        self.supabase.table("website").delete().eq("wid", wid).execute()

    def get_available_sites_for_user(self, current_uid: int) -> List[Dict[str, Any]]:
        """Fetch websites not owned by the given user"""
        response = self.supabase.table("website").select("*").neq("uid", current_uid).execute()
        return response.data

    def get_websites_by_user(self, uid: int) -> List[Dict[str, Any]]:
        """Fetch websites owned by a specific user"""
        response = self.supabase.table("website").select("*").eq("uid", uid).execute()
        return response.data