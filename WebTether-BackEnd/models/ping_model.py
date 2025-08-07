# models/ping_model.py

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Initialize Supabase client
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class PingModel:
    """
    Data Access Layer for the 'ping' table.
    Handles CRUD operations for ping records.
    """

    def __init__(self):
        self.supabase = supabase

    def create_ping(self, wid, is_up, latency_ms=None, region=None, uid=None, tx_hash=None, fee_paid_numeric=None):
        """
        Inserts a new ping record into the database.
        """
        data = {
            "wid": wid,
            "uid": uid,
            "is_up": is_up,
            "latency_ms": latency_ms,
            "region": region,
            "tx_hash": tx_hash,
            "fee_paid_numeric": fee_paid_numeric
        }
        return self.supabase.table("ping").insert(data).execute()

    def get_all_pings(self):
        """
        Returns all pings from the database.
        """
        return self.supabase.table("ping").select("*").execute()

    def get_ping_by_id(self, pid):
        """
        Returns a single ping by its primary key.
        """
        return self.supabase.table("ping").select("*").eq("pid", pid).single().execute()

    def update_ping(self, pid, data):
        """
        Updates a ping record with the given data.
        """
        return self.supabase.table("ping").update(data).eq("pid", pid).execute()

    def delete_ping(self, pid):
        """
        Deletes a ping record by its ID.
        """
        return self.supabase.table("ping").delete().eq("pid", pid).execute()
