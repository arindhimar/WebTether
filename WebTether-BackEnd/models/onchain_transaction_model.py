# models/onchain_transaction_model.py
"""
OnChainTransactionModel - thin DB layer for the `onchain_transactions` table.

Schema (relevant columns):
 - tx_hash (PK text), uid (bigint), pid (bigint, nullable),
   token_address (text), token_amount (numeric), gas_used (bigint), created_at (timestamp)

This model returns Supabase response objects (so controllers can inspect `.data`).
Controllers should use the helpers used throughout the project to normalize responses.
"""

from supabase import create_client
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class OnChainTransactionModel:
    def __init__(self):
        self.supabase = supabase
        self.table = "onchain_transactions"

    def create_transaction(self,
                           tx_hash: str,
                           uid: int,
                           pid: Optional[int] = None,
                           token_address: Optional[str] = None,
                           token_amount: Optional[float] = None,
                           gas_used: Optional[int] = None):
        """
        Insert a new on-chain transaction record.
        Returns the Supabase response object.
        """
        if not tx_hash or not uid or token_address is None or token_amount is None:
            raise ValueError("tx_hash, uid, token_address and token_amount are required")

        payload = {
            "tx_hash": tx_hash,
            "uid": uid,
            "token_address": token_address,
            "token_amount": token_amount
        }
        if pid is not None:
            payload["pid"] = pid
        if gas_used is not None:
            payload["gas_used"] = gas_used

        return self.supabase.table(self.table).insert(payload).execute()

    def get_transaction_by_hash(self, tx_hash: str):
        """
        Return a supabase response for a single tx hash.
        Use maybe_single() to avoid throwing when 0 rows (returns None)
        """
        return self.supabase.table(self.table).select("*").eq("tx_hash", tx_hash).maybe_single().execute()

    def get_transactions_by_user(self, uid: int, limit: Optional[int] = None, offset: Optional[int] = None):
        """
        Return transactions for a given user id (Supabase response).
        """
        builder = self.supabase.table(self.table).select("*").eq("uid", uid).order("created_at", desc=True)
        if isinstance(limit, int):
            builder = builder.limit(limit)
        if isinstance(offset, int):
            builder = builder.offset(offset)
        return builder.execute()

    def get_all_transactions(self, limit: Optional[int] = None, offset: Optional[int] = None):
        """
        Return all transactions (admin use). Use limit/offset for pagination.
        """
        builder = self.supabase.table(self.table).select("*").order("created_at", desc=True)
        if isinstance(limit, int):
            builder = builder.limit(limit)
        if isinstance(offset, int):
            builder = builder.offset(offset)
        return builder.execute()

    def update_transaction(self, tx_hash: str, data: dict):
        """
        Update allowed fields for a transaction. tx_hash identifies the record.
        Allowed fields: pid, token_address, token_amount, gas_used
        """
        if not data:
            raise ValueError("No update payload provided")
        allowed = {"pid", "token_address", "token_amount", "gas_used"}
        payload = {k: v for k, v in data.items() if k in allowed}
        if not payload:
            raise ValueError("No updatable fields found in payload")
        return self.supabase.table(self.table).update(payload).eq("tx_hash", tx_hash).execute()

    def delete_transaction(self, tx_hash: str):
        """
        Delete a transaction by tx_hash.
        """
        return self.supabase.table(self.table).delete().eq("tx_hash", tx_hash).execute()
