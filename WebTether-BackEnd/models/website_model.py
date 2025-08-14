# models/website_model.py
"""
WebsiteModel - thin Supabase-backed model for `website` table.

Responsibilities:
 - Provide CRUD operations for website rows.
 - Keep business logic minimal (controllers enforce auth/ownership).
 - Return Supabase response objects so controllers can inspect .data / status.
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class WebsiteModel:
    def __init__(self):
        self.supabase = supabase
        self.table = "website"

    # Create a website row. uid should be the owner user id.
    def create_website(self, url: str, uid: int, category: str = None,
                       name: str = None, reward_per_ping: float = None, status: str = None):
        if not url:
            raise ValueError("url is required")

        payload = {
            "url": url,
            "uid": uid
        }
        if category is not None:
            payload["category"] = category
        if name is not None:
            payload["name"] = name
        if reward_per_ping is not None:
            payload["reward_per_ping"] = reward_per_ping
        if status is not None:
            payload["status"] = status

        return self.supabase.table(self.table).insert(payload).execute()

    # Read operations
    def get_all_websites(self):
        return self.supabase.table(self.table).select("*").execute()

    def get_website_by_id(self, wid: int):
        # maybe_single to avoid errors when no rows (returns None)
        return self.supabase.table(self.table).select("*").eq("wid", wid).maybe_single().execute()

    def get_websites_by_owner(self, uid: int):
        return self.supabase.table(self.table).select("*").eq("uid", uid).execute()

    def get_websites_excluding_user(self, uid: int):
        """Return websites not owned by the given uid."""
        return self.supabase.table(self.table).select("*").neq("uid", uid).execute()

    def get_available_sites_for_user(self, current_uid: int):
        """
        Convenience wrapper used by controllers to fetch sites that
        the current user can validate (not their own).
        """
        return self.get_websites_excluding_user(current_uid)

    # Update & delete
    def update_website(self, wid: int, data: dict):
        # whitelist fields to prevent accidental overwrite
        allowed = {"url", "category", "status", "name", "reward_per_ping", "uid"}
        payload = {k: v for k, v in (data or {}).items() if k in allowed}
        if not payload:
            raise ValueError("No updatable fields provided")
        return self.supabase.table(self.table).update(payload).eq("wid", wid).execute()

    def delete_website(self, wid: int):
        return self.supabase.table(self.table).delete().eq("wid", wid).execute()

    def get_websites_by_user(self, uid: int):
        return self.supabase.table(self.table).select("*").eq("uid", uid).execute()