# models/ping_model.py
"""
PingModel - CRUD + helper queries for `ping` table.

Schema (relevant columns):
 - pid, wid, uid, timestamp, latency_ms, region, is_up, replit_used,
   tx_hash, fee_paid_numeric, source, checked_by_uid

This model is intentionally thin: controllers enforce auth/ownership and
higher-level logic; the model only performs DB operations and returns
Supabase client responses (so controllers can inspect .data).
"""

from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class PingModel:
    def __init__(self):
        self.supabase = supabase
        self.table = "ping"

    def create_ping(self,
                    wid: int,
                    is_up: bool,
                    latency_ms: Optional[int] = None,
                    region: Optional[str] = None,
                    uid: Optional[int] = None,
                    tx_hash: Optional[str] = None,
                    fee_paid_numeric: Optional[float] = None,
                    source: Optional[str] = "manual",
                    checked_by_uid: Optional[int] = None):
        """
        Insert a ping record. Returns Supabase response object.
        """
        payload = {
            "wid": wid,
            "is_up": is_up,
        }
        if uid is not None:
            payload["uid"] = uid
        if latency_ms is not None:
            payload["latency_ms"] = latency_ms
        if region is not None:
            payload["region"] = region
        if tx_hash is not None:
            payload["tx_hash"] = tx_hash
        if fee_paid_numeric is not None:
            payload["fee_paid_numeric"] = fee_paid_numeric
        if source is not None:
            payload["source"] = source
        if checked_by_uid is not None:
            payload["checked_by_uid"] = checked_by_uid

        return self.supabase.table(self.table).insert(payload).execute()

    def get_all_pings(self):
        return self.supabase.table(self.table).select("*").order("timestamp", desc=True).execute()

    def get_ping_by_id(self, pid: int):
        return self.supabase.table(self.table).select("*").eq("pid", pid).maybe_single().execute()

    def update_ping(self, pid: int, data: dict):
        # whitelist allowed update fields to be safe
        allowed = {"is_up", "latency_ms", "region", "fee_paid_numeric", "source", "checked_by_uid", "tx_hash"}
        payload = {k: v for k, v in (data or {}).items() if k in allowed}
        if not payload:
            raise ValueError("No updatable fields provided")
        return self.supabase.table(self.table).update(payload).eq("pid", pid).execute()

    def delete_ping(self, pid: int):
        return self.supabase.table(self.table).delete().eq("pid", pid).execute()

    def get_recent_pings_by_wid(self, wid: int, limit: int = 50):
        return self.supabase.table(self.table).select("*").eq("wid", wid).order("timestamp", desc=True).limit(limit).execute()

    def get_pings_by_uid(self, uid: int, limit: int = 100):
        return self.supabase.table(self.table).select("*").eq("uid", uid).order("timestamp", desc=True).limit(limit).execute()

    def get_stats_for_website(self, wid: int):
        """
        Example helper: you might want aggregated stats via SQL in production.
        Here we return raw rows — controller can aggregate.
        """
        return self.get_recent_pings_by_wid(wid, limit=1000)

    def get_pings_by_user(self, uid: int, limit: int = 100):
        return self.supabase.table(self.table).select("*").eq("uid", uid).order("timestamp", desc=True).limit(limit).execute()
