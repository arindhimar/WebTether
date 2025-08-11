# controllers/ping_controller.py
"""
Ping controller
- Handles CRUD for ping records
- Handles manual ping flow which requires JWT auth and an on-chain tx (simulated or real)
- Provides wallet/transaction helper endpoints for the Hardhat dev flow
Notes:
- This file performs defensive normalization of `user_id` extracted from decoded JWT claims.
  We do this inside the controller to avoid changing the shared jwt utils.
"""

from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from models.user_model import UserModel
from models.onchain_transaction_model import OnChainTransactionModel
from utils.jwt_utils import decode_token
import requests
import os
import time
import random
from web3 import Web3
from datetime import datetime

ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()
user_model = UserModel()
tx_model = OnChainTransactionModel()

# Hardhat local network configuration (used for simulated flow)
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545")))
CONTRACT_ADDRESS = os.getenv("PING_PAYMENT_CONTRACT", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
PING_COST_ETH = 0.0002

# Fake transaction simulation data (for local dev/hardhat flow)
FAKE_TX_CODES = [f"TX-{str(i+1).zfill(3)}" for i in range(20)]
HARDHAT_ACCOUNTS = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
]


# ---------------------
# Helper: user id normalizer
# ---------------------
def _normalize_user_id(uid_field):
    """
    Normalize whatever is inside the 'user_id' claim into an int.
    Accepts:
      - int
      - numeric string
      - dict like {"user_id": 31} or {"id": 31}
      - nested dicts like {"user_id": {"user_id": 31}}
    Returns integer or raises ValueError.
    """
    if isinstance(uid_field, int):
        return uid_field
    if isinstance(uid_field, str):
        # string containing numeric value
        try:
            return int(uid_field)
        except ValueError:
            raise ValueError("user_id string is not numeric")
    if isinstance(uid_field, dict):
        # attempt known keys
        for k in ("user_id", "id", "uid"):
            if k in uid_field:
                return _normalize_user_id(uid_field[k])
        # single-value dict - try its single value
        if len(uid_field) == 1:
            (v,) = uid_field.values()
            return _normalize_user_id(v)
    raise ValueError("Cannot normalize user_id")


def _extract_user_id_from_claims(claims):
    """
    Defensive extractor for user_id from decoded JWT claims.
    Returns int or None.
    """
    if not isinstance(claims, dict):
        return None
    uid_field = claims.get("user_id") or claims.get("id") or claims.get("uid")
    if uid_field is None:
        return None
    try:
        return _normalize_user_id(uid_field)
    except ValueError:
        return None


# ---------------------
# Dev helper: simulate hardhat tx
# ---------------------
def simulate_hardhat_transaction(tx_hash, from_address=None):
    """Return a simulated transaction dict for local development when using FAKE_TX_CODES."""
    if tx_hash not in FAKE_TX_CODES:
        return None
    if not from_address:
        from_address = random.choice(HARDHAT_ACCOUNTS)
    block_number = random.randint(1000, 9999)
    gas_used = random.randint(21000, 50000)
    return {
        "hash": tx_hash,
        "from": from_address,
        "to": CONTRACT_ADDRESS,
        "value": int(w3.to_wei(PING_COST_ETH, "ether")),
        "gas_used": gas_used,
        "block_number": block_number,
        "status": 1,
        "timestamp": int(time.time()),
    }


# ---------------------
# CRUD endpoints
# ---------------------
@ping_controller.route("/", methods=["POST"])
def create_ping():
    data = request.json or {}
    res = ping_model.create_ping(
        data["wid"],
        data["is_up"],
        data.get("latency_ms"),
        data.get("region"),
        data.get("uid"),
        data.get("tx_hash"),
        data.get("fee_paid_numeric"),
    )
    return jsonify(res.data), 201


@ping_controller.route("/", methods=["GET"])
def list_pings():
    return jsonify(ping_model.get_all_pings().data), 200


@ping_controller.route("/<int:pid>", methods=["GET"])
def get_ping(pid):
    return jsonify(ping_model.get_ping_by_id(pid).data), 200


@ping_controller.route("/<int:pid>", methods=["PUT"])
def update_ping(pid):
    data = request.json or {}
    return jsonify(ping_model.update_ping(pid, data).data), 200


@ping_controller.route("/<int:pid>", methods=["DELETE"])
def delete_ping(pid):
    ping_model.delete_ping(pid)
    return jsonify({"message": "Deleted"}), 200


# ---------------------
# Manual ping endpoint (main flow)
# ---------------------
@ping_controller.route("/manual", methods=["POST"])
def manual_ping():
    """
    Manual ping flow (Hardhat/dev + Cloudflare worker):
    - Authenticate via JWT (token must be provided in Authorization header)
    - Validate wid, url and tx_hash (tx_hash is a fake code in the local dev flow)
    - Ensure user exists
    - Validate tx_hash unused (against onchain_transactions table)
    - Simulate or verify transaction (we simulate for HA RDHAT local flow if tx is one of FAKE_TX_CODES)
    - Call user's agent (Cloudflare worker or Replit agent) to execute the real HTTP check
    - Store ping + record onchain transaction row
    """
    # 1. Authenticate
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401
    token = auth.split(" ", 1)[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    # 2. Parse payload
    data = request.get_json(silent=True) or {}
    wid = data.get("wid")
    url = data.get("url")
    tx_hash = data.get("tx_hash")

    if not (wid and url and tx_hash):
        return jsonify({"error": "wid, url and tx_hash are required"}), 400

    # 3. Ensure user exists
    user_row = user_model.get_user_by_id(uid).data
    if not user_row:
        return jsonify({"error": "User not found"}), 404

    # 4. Prevent owner pinging their own website (optional check)
    #    If you want to allow owners to pay for others to ping their site, remove this.
    website_owner_check = None
    try:
        # attempt to fetch website to verify owner
        website_res = ping_model.supabase.table("website").select("uid").eq("wid", wid).single().execute()
        website_owner_check = website_res.data if hasattr(website_res, "data") else None
    except Exception:
        website_owner_check = None

    if website_owner_check and isinstance(website_owner_check, dict):
        owner_id = website_owner_check.get("uid")
        # Normalize owner id if necessary
        try:
            owner_id = int(owner_id)
        except Exception:
            owner_id = None
        if owner_id == uid:
            return jsonify({"error": "You cannot manually ping your own site"}), 403

    # 5. Ensure transaction code hasn't been used (local/Hardhat flow)
    existing_res = tx_model.get_transaction_by_hash(tx_hash)
    existing = None
    if existing_res is not None:
        # supabase .maybe_single().execute() returns an object with .data attribute
        existing = getattr(existing_res, "data", existing_res)
    if existing:
        return jsonify({"error": "Transaction code already used", "tx_hash": tx_hash}), 409

    # 6. Simulate or verify transaction (for local dev, accept FAKE_TX_CODES)
    simulated_tx = None
    if tx_hash in FAKE_TX_CODES:
        simulated_tx = simulate_hardhat_transaction(tx_hash)
        # mark a numeric paid amount
        paid_amount = PING_COST_ETH
    else:
        # For a production on-chain flow you would fetch receipt via web3 and validate it
        # Here we refuse unknown tx_hash (in local dev we use FAKE_TX_CODES)
        return jsonify({"error": "Unknown tx_hash for local dev flow; use a valid simulated code"}), 400

    # 7. Execute real ping by calling the user's worker/agent URL
    agent_url = user_row.get("agent_url")
    if not agent_url:
        return jsonify({"error": "No agent_url configured for user"}), 400

    try:
        resp = requests.post(agent_url, json={"url": url}, timeout=15)
        resp.raise_for_status()
        result = resp.json()
    except Exception as e:
        return jsonify({"error": f"Failed to call agent: {str(e)}"}), 502

    # 8. Save ping
    ping_row = ping_model.create_ping(
        wid=wid,
        is_up=result.get("is_up", False),
        latency_ms=result.get("latency_ms"),
        region=result.get("region", "cloudflare-edge"),
        uid=uid,
        tx_hash=tx_hash,
        fee_paid_numeric=PING_COST_ETH,
    ).data[0]

    # 9. Save on-chain transaction record
    tx_model.create_transaction(
        tx_hash=tx_hash,
        uid=uid,
        pid=ping_row["pid"],
        token_address="ETH",
        token_amount=PING_COST_ETH,
        gas_used=simulated_tx.get("gas_used") if simulated_tx else None,
    )

    # 10. Return combined result
    return (
        jsonify(
            {
                "status": "recorded",
                "ping": ping_row,
                "onchain": {
                    "tx_hash": tx_hash,
                    "amount": PING_COST_ETH,
                    "gas_used": simulated_tx.get("gas_used") if simulated_tx else None,
                    "simulated": True,
                },
                "result": result,
            }
        ),
        200,
    )


# ---------------------
# Wallet / transaction helpers (dev)
# ---------------------
@ping_controller.route("/wallet/balance", methods=["GET"])
def get_wallet_balance():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401
    token = auth.split(" ", 1)[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    try:
        user_row = user_model.get_user_by_id(uid).data
        if not user_row:
            return jsonify({"error": "User not found"}), 404

        user_transactions = tx_model.get_transactions_by_user(uid) or []
        total_spent = sum(float(tx.get("token_amount", 0)) for tx in user_transactions if isinstance(tx, dict))
        starting_balance = 1.0
        current_balance = max(0, starting_balance - total_spent)
        wallet_address = user_row.get("wallet_address") or random.choice(HARDHAT_ACCOUNTS)

        return (
            jsonify(
                {
                    "wallet_address": wallet_address,
                    "eth_balance": f"{current_balance:.4f}",
                    "usd_value": f"{current_balance * 2000:.2f}",
                    "total_spent": f"{total_spent:.4f}",
                    "total_pings": len(user_transactions),
                    "starting_balance": f"{starting_balance:.4f}",
                    "simulated": True,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": f"Failed to get wallet balance: {str(e)}"}), 500


@ping_controller.route("/wallet/transactions", methods=["GET"])
def get_transaction_history():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401
    token = auth.split(" ", 1)[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    try:
        transactions = tx_model.get_transactions_by_user(uid) or []
        formatted = []
        for tx in transactions:
            if isinstance(tx, dict):
                formatted.append(
                    {
                        "tx_hash": tx.get("tx_hash"),
                        "amount": tx.get("token_amount"),
                        "timestamp": tx.get("created_at") or datetime.now().isoformat(),
                        "status": "success",
                        "type": "ping_payment",
                    }
                )
        return jsonify({"transactions": formatted, "total_count": len(formatted)}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to get transaction history: {str(e)}"}), 500


# ---------------------
# Network status (dev)
# ---------------------
@ping_controller.route("/network/status", methods=["GET"])
def get_network_status():
    try:
        return (
            jsonify(
                {
                    "connected": True,
                    "chain_id": 31337,
                    "network_name": "Hardhat Local",
                    "rpc_url": os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545"),
                    "contract_address": CONTRACT_ADDRESS,
                    "ping_cost_eth": PING_COST_ETH,
                    "available_tx_codes": len(FAKE_TX_CODES),
                    "simulated": True,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": f"Failed to get network status: {str(e)}"}), 500
