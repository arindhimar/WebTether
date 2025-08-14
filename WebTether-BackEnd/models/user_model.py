# models/user_model.py
"""
UserModel - Supabase-backed model for `users` table.

Responsibilities:
- Provide thin CRUD wrappers around Supabase client.
- Normalize/validate inputs where sensible.
- Return Supabase response objects (so callers can inspect .data/.status_code)
- Keep business logic out of model (controllers should enforce flows, rollbacks, etc.)
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class UserModel:
    def __init__(self):
        self.supabase = supabase
        self.table = "users"

    # ------------------------
    # CRUD
    # ------------------------
    def create_user(self, name: str, is_visitor: bool = False, secret_key: str = None,
                    agent_url: str = None, wallet_address: str = None, role: str = None,
                    balance_numeric: float = None):
        """
        Insert a new user row.

        Parameters:
          - name: str (required)
          - is_visitor: bool (optional) - kept for backward compatibility; role takes precedence
          - secret_key: str (optional)
          - agent_url: str (optional)
          - wallet_address: str (optional)
          - role: one of 'owner'|'validator'|'visitor' (optional)
          - balance_numeric: numeric (optional)

        Returns:
          - Supabase response object from .insert(...).execute()
        Raises:
          - ValueError for invalid inputs
        """
        if not name:
            raise ValueError("name is required")

        payload = {
            "name": name,
            "isVisitor": bool(is_visitor) if is_visitor is not None else False,
            "secret_key": secret_key,
            "agent_url": agent_url,
            "wallet_address": wallet_address
        }

        # role precedence: explicit role param -> infer from is_visitor -> default 'owner'
        if role:
            payload["role"] = role
        else:
            payload["role"] = "validator" if is_visitor else "owner"

        if balance_numeric is not None:
            payload["balance_numeric"] = balance_numeric

        try:
            return self.supabase.table(self.table).insert(payload).execute()
        except Exception as e:
            # don't leak internal exceptions here, let controller decide what to do
            raise

    def get_all_users(self):
        """Return supabase response for SELECT * FROM users"""
        return self.supabase.table(self.table).select("*").execute()

    def get_user_by_id(self, uid):
        """
        Get a single user by id.
        Returns supabase response object (with .data) or raises on API error.
        """
        return self.supabase.table(self.table).select("*").eq("id", uid).maybe_single().execute()

    def update_user(self, uid, data: dict):
        """
        Update user row with fields in `data`.
        Allowed fields are limited to prevent accidental overwrites.
        Returns supabase response.
        """
        if not isinstance(data, dict):
            raise ValueError("data must be a dict")

        allowed = {"name", "isVisitor", "secret_key", "agent_url", "wallet_address", "role", "balance_numeric"}
        payload = {k: v for k, v in data.items() if k in allowed}
        if not payload:
            raise ValueError("No valid fields to update")

        return self.supabase.table(self.table).update(payload).eq("id", uid).execute()

    def delete_user(self, uid):
        """Delete user row by id (supabase response)"""
        return self.supabase.table(self.table).delete().eq("id", uid).execute()
