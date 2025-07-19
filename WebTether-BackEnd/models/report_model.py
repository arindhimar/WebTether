from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class ReportModel:
    def __init__(self):
        self.supabase = supabase

    def create_report(self, pid, reason, uid=None):
        data = {
            "pid": pid,
            "uid": uid,
            "reason": reason
        }
        return self.supabase.table("report").insert(data).execute()

    def get_all_reports(self):
        return self.supabase.table("report").select("*").execute()

    def get_report_by_id(self, rid):
        return self.supabase.table("report").select("*").eq("rid", rid).single().execute()

    def update_report(self, rid, data):
        return self.supabase.table("report").update(data).eq("rid", rid).execute()

    def delete_report(self, rid):
        return self.supabase.table("report").delete().eq("rid", rid).execute()
