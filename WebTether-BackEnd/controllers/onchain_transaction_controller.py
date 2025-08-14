# controllers/onchain_transaction_controller.py
"""
Blueprint for on-chain transaction CRUD & query endpoints.

Endpoints:
 - POST   /transactions/            -> create a new transaction record
 - GET    /transactions/            -> list (all) transactions (supports ?limit & ?offset)
 - GET    /transactions/<tx_hash>   -> fetch single transaction
 - GET    /transactions/user/<uid>  -> fetch transactions for a user (auth recommended)
 - PUT    /transactions/<tx_hash>   -> update transaction (allowed fields only)
 - DELETE /transactions/<tx_hash>   -> delete transaction

Notes:
 - This controller is defensive: it normalizes Supabase responses and validates payloads.
 - Authentication / authorization: for now we expect token for user-specific endpoints.
   In production you should enforce roles (admin vs user) and ensure only owners/admins can update/delete.
"""

from flask import Blueprint, request, jsonify
from models.onchain_transaction_model import OnChainTransactionModel
from utils.jwt_utils import decode_token
from datetime import datetime
import traceback

onchain_transaction_controller = Blueprint("onchain_transaction_controller", __name__)
tx_model = OnChainTransactionModel()


# Helper to unwrap supabase response object or pass-through python structures
def _unwrap_resp(resp):
    if resp is None:
        return None
    if hasattr(resp, "data"):
        return resp.data
    return resp


# -------------------------
# Create
# -------------------------
@onchain_transaction_controller.route("/", methods=["POST"])
def create_onchain_transaction():
    """
    Create a transaction record.
    Expected JSON: { tx_hash, uid, token_address, token_amount, pid?, gas_used? }
    """
    try:
        body = request.get_json(silent=True) or {}
        tx_hash = body.get("tx_hash")
        uid = body.get("uid")
        token_address = body.get("token_address")
        token_amount = body.get("token_amount")
        pid = body.get("pid")
        gas_used = body.get("gas_used")

        # Basic validation
        if not tx_hash:
            return jsonify({"error": "tx_hash is required"}), 400
        if uid is None:
            return jsonify({"error": "uid is required"}), 400
        if token_address is None:
            return jsonify({"error": "token_address is required"}), 400
        if token_amount is None:
            return jsonify({"error": "token_amount is required"}), 400

        # create
        resp = tx_model.create_transaction(tx_hash=tx_hash,
                                           uid=int(uid),
                                           pid=int(pid) if pid is not None else None,
                                           token_address=token_address,
                                           token_amount=float(token_amount),
                                           gas_used=int(gas_used) if gas_used is not None else None)

        created = _unwrap_resp(resp)
        # created is usually a list with inserted row(s) — return first element if present
        if isinstance(created, list) and len(created) > 0:
            return jsonify(created[0]), 201
        return jsonify(created), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to create transaction", "detail": str(e), "trace": tb}), 500


# -------------------------
# List / Query
# -------------------------
@onchain_transaction_controller.route("/", methods=["GET"])
def list_transactions():
    """
    List transactions. Optional query params: ?limit=50&offset=0
    """
    try:
        limit = request.args.get("limit")
        offset = request.args.get("offset")
        limit = int(limit) if limit and limit.isdigit() else None
        offset = int(offset) if offset and offset.isdigit() else None

        resp = tx_model.get_all_transactions(limit=limit, offset=offset)
        return jsonify(_unwrap_resp(resp)), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to list transactions", "detail": str(e), "trace": tb}), 500


@onchain_transaction_controller.route("/<string:tx_hash>", methods=["GET"])
def get_transaction(tx_hash):
    """Get a single transaction by tx_hash."""
    try:
        resp = tx_model.get_transaction_by_hash(tx_hash)
        data = _unwrap_resp(resp)
        # maybe_single() returns None or dict
        if not data:
            return jsonify({"error": "Transaction not found"}), 404
        return jsonify(data), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to fetch transaction", "detail": str(e), "trace": tb}), 500


@onchain_transaction_controller.route("/user/<int:uid>", methods=["GET"])
def get_transactions_for_user(uid):
    """
    Get transactions for a given user id.
    Auth: requires a valid token (to prevent data scraping), and in production check ownership/admin.
    """
    try:
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth.split(" ", 1)[1]
        claims = decode_token(token)
        if not claims:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Optional: enforce that the caller is the same uid or an admin (left as TODO)
        resp = tx_model.get_transactions_by_user(uid)
        return jsonify(_unwrap_resp(resp)), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to fetch user transactions", "detail": str(e), "trace": tb}), 500


# -------------------------
# Update / Delete
# -------------------------
@onchain_transaction_controller.route("/<string:tx_hash>", methods=["PUT"])
def update_transaction(tx_hash):
    """
    Update allowed fields of a transaction:
      payload may include: pid, token_address, token_amount, gas_used
    """
    try:
        data = request.get_json(silent=True) or {}
        if not data:
            return jsonify({"error": "No update payload provided"}), 400

        resp = tx_model.update_transaction(tx_hash, data)
        return jsonify(_unwrap_resp(resp)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to update transaction", "detail": str(e), "trace": tb}), 500


@onchain_transaction_controller.route("/<string:tx_hash>", methods=["DELETE"])
def delete_transaction(tx_hash):
    """
    Delete a transaction by hash. In production protect this with admin-only checks.
    """
    try:
        resp = tx_model.delete_transaction(tx_hash)
        return jsonify({"message": "Deleted", "detail": _unwrap_resp(resp)}), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "Failed to delete transaction", "detail": str(e), "trace": tb}), 500
