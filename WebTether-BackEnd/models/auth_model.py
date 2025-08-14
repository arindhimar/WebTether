# models/auth_model.py
"""
AuthModel - Supabase-backed model for `auth` table.

Design goals:
- Keep methods thin: return the raw Supabase response where possible (.execute()) so existing callers
  can use .data, .status_code, etc.
- Provide a few convenience helpers (sign_in) that return structured dicts for controller logic.
- Defensive: catch Supabase/API errors and raise ValueError with useful message so controllers can
  decide to rollback or surface the error to clients.
"""

from supabase import create_client
import os
from dotenv import load_dotenv
from utils.jwt_utils import hash_password, verify_password

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class AuthModel:
    def __init__(self):
        self.supabase = supabase
        # table name constant helps reduce typos
        self.table = "auth"

    # ------------------------------
    # Low-level CRUD operations
    # ------------------------------
    def create_auth(self, email: str, password: str, user_id: int = None):
        """
        Insert a new auth row (email + hashed password).
        Raises ValueError if email already exists or insertion fails.
        Returns: supabase response object from .insert(...).execute()
        """
        if not email or not password:
            raise ValueError("email and password are required")

        # Normalize input
        email = email.strip().lower()

        # Check duplicate
        try:
            existing = self.supabase.table(self.table).select("*").eq("email", email).execute()
            # supabase returns an object with .data attribute (list)
            if existing and getattr(existing, "data", None):
                if len(existing.data) > 0:
                    raise ValueError("Email already exists")
        except Exception as e:
            # If supabase error occurred while checking duplicates, surface as ValueError
            raise ValueError(f"Failed to check existing email: {e}")

        # Hash the password before storing
        hashed = hash_password(password)

        data = {"email": email, "pass": hashed, "user_id": user_id}
        try:
            res = self.supabase.table(self.table).insert(data).execute()
            return res
        except Exception as e:
            # Wrap as ValueError so controllers can rollback created user if needed
            raise ValueError(f"Failed to create auth record: {e}")

    def get_all_auths(self):
        """Return supabase response for SELECT * FROM auth"""
        return self.supabase.table(self.table).select("*").execute()

    def get_auth_by_id(self, auth_id: int):
        """Return single auth row by id (supabase response)"""
        return self.supabase.table(self.table).select("*").eq("id", auth_id).single().execute()

    def get_auth_by_email(self, email: str):
        """Return single auth row by email (supabase response)"""
        if not email:
            return None
        return self.supabase.table(self.table).select("*").eq("email", email.strip().lower()).single().execute()

    def update_auth(self, auth_id: int, data: dict):
        """
        Update auth row. If 'pass' is in data, hash it first.
        Returns supabase response.
        """
        if not isinstance(data, dict):
            raise ValueError("update data must be a dict")
        payload = data.copy()
        if "pass" in payload and payload["pass"] is not None:
            payload["pass"] = hash_password(payload["pass"])
        return self.supabase.table(self.table).update(payload).eq("id", auth_id).execute()

    def delete_auth(self, auth_id: int):
        """Delete auth row by id (supabase response)"""
        return self.supabase.table(self.table).delete().eq("id", auth_id).execute()

    # ------------------------------
    # Convenience auth flows
    # ------------------------------
    def sign_up(self, email: str, password: str, user_id: int):
        """
        Thin wrapper for create_auth. Keeps naming consistent with controller expectations.
        May raise ValueError on failure.
        """
        return self.create_auth(email, password, user_id)

    def sign_in(self, email: str, password: str):
        """
        Authenticate a user:
        - Fetch stored auth row by email
        - Verify password via verify_password helper
        Returns:
          { "status": "success", "user": auth_row_dict } on success
          { "status": "failed", "reason": "..." } on failure
        """
        if not email or not password:
            return {"status": "failed", "reason": "Missing email or password"}

        try:
            r = self.get_auth_by_email(email)
        except Exception as e:
            return {"status": "failed", "reason": f"Lookup failed: {e}"}

        row = None
        # supabase returns object with .data or a plain dict depending on call-site; be defensive
        if r is None:
            return {"status": "failed", "reason": "Email not found"}
        if hasattr(r, "data"):
            row = r.data
        else:
            row = r

        if not row:
            return {"status": "failed", "reason": "Email not found"}

        # row may be dict with fields id, email, pass, user_id
        stored_hash = row.get("pass") if isinstance(row, dict) else None
        if not stored_hash:
            return {"status": "failed", "reason": "No stored password for user"}
        # Verify password
        if verify_password(password, stored_hash):
            return {"status": "success", "user": row}
        return {"status": "failed", "reason": "Invalid credentials"}
