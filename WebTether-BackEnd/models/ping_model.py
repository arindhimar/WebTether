from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class PingModel:
    def __init__(self):
        self.supabase = supabase

    def create_ping(self, wid, is_up, latency_ms, region, uid):
        data = {
            "wid": wid,
            "is_up": is_up,
            "latency_ms": latency_ms,
            "region": region,
            "uid": uid
        }
        return self.supabase.table("ping").insert(data).execute()

    def get_all_pings(self):
        return self.supabase.table("ping").select("*").execute()

    def get_ping_by_id(self, pid):
        return self.supabase.table("ping").select("*").eq("pid", pid).single().execute()

    def update_ping(self, pid, data):
        return self.supabase.table("ping").update(data).eq("pid", pid).execute()

    def delete_ping(self, pid):
        return self.supabase.table("ping").delete().eq("pid", pid).execute()
