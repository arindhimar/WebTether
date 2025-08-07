import os
from dotenv import load_dotenv
from supabase import create_client

# Load Supabase credentials from environment
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class ReportModel:
    """
    Model for managing user-generated reports on pings.
    """

    def __init__(self):
        self.supabase = supabase

    def create_report(self, pid, reason, uid=None):
        """
        Inserts a new report record.

        Args:
            pid (int): The ping ID being reported.
            reason (str): Reason for reporting.
            uid (int, optional): User ID reporting the issue.

        Returns:
            Supabase response object
        """
        data = {
            "pid": pid,
            "uid": uid,
            "reason": reason
        }
        return self.supabase.table("report").insert(data).execute()

    def get_all_reports(self):
        """
        Fetch all reports.

        Returns:
            List of report rows
        """
        return self.supabase.table("report").select("*").execute()

    def get_report_by_id(self, rid):
        """
        Get a single report by its ID.
        """
        return self.supabase.table("report").select("*").eq("rid", rid).single().execute()

    def update_report(self, rid, data):
        """
        Update a report with new data.
        """
        return self.supabase.table("report").update(data).eq("rid", rid).execute()

    def delete_report(self, rid):
        """
        Delete a report by ID.
        """
        return self.supabase.table("report").delete().eq("rid", rid).execute()
