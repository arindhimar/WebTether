import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables for Supabase credentials
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class OnChainTransactionModel:
    """
    Model for managing on-chain transaction records in Supabase.
    """

    def __init__(self):
        self.supabase = supabase

    def create_transaction(self, tx_hash, uid, pid=None, token_address=None, token_amount=None, gas_used=None):
        """
        Inserts a new on-chain transaction record into the database.
        """
        data = {
            "tx_hash": tx_hash,
            "uid": uid,
            "pid": pid,
            "token_address": token_address,
            "token_amount": token_amount,
            "gas_used": gas_used
        }
        return self.supabase.table("onchain_transactions").insert(data).execute()

    def get_transaction_by_hash(self, tx_hash):
        """
        Retrieves a transaction by its hash. Returns None if not found.
        """
        return self.supabase.table("onchain_transactions") \
            .select("*") \
            .eq("tx_hash", tx_hash) \
            .maybe_single() \
            .execute()

    def get_transactions_by_user(self, uid):
        """
        Retrieves all transactions initiated by a specific user.
        """
        response = self.supabase.table("onchain_transactions") \
            .select("*") \
            .eq("uid", uid) \
            .execute()
        return response.data
