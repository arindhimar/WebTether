# controllers/ping_controller.py
"""
Ping controller (defensive)
- normalizes model responses from Supabase client (object with .data) or plain dict/list
- handles manual ping flow (simulate Hardhat TX codes or real txs depending on your setup)
- provides wallet balance & transactions endpoints (returns simulated data for Hardhat)
"""

from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from models.user_model import UserModel
from models.onchain_transaction_model import OnChainTransactionModel
from utils.jwt_utils import decode_token
import requests, os, time, random
from web3 import Web3
from datetime import datetime

ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()
user_model = UserModel()
tx_model = OnChainTransactionModel()

# Hardhat / local network basics (used for simulation only)
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545")))
CONTRACT_ADDRESS = os.getenv("PING_PAYMENT_CONTRACT", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
PING_COST_ETH = 0.0002

# Fake transaction simulation codes (for demo/hardhat flow)
FAKE_TX_CODES = [f"TX-{str(i+1).zfill(3)}" for i in range(20)]
HARDHAT_ACCOUNTS = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
]


# -------------------------
# Helper utilities
# -------------------------
def _unwrap_supabase_response(resp):
    """
    Convert a Supabase client response OR already-decoded list/dict into a plain structure.
    - If object has `.data` attribute, return resp.data
    - If resp is list/dict, return it directly
    - If None, return None
    """
    if resp is None:
        return None
    if hasattr(resp, "data"):
        return resp.data
    return resp


def _get_single_record(resp):
    """
    Return a single dict record from a response that might be:
      - supabase response with .data -> dict or [dict]
      - a dict directly
      - a list of dicts
    Returns dict or None.
    """
    data = _unwrap_supabase_response(resp)
    if data is None:
        return None
    if isinstance(data, dict):
        return data
    if isinstance(data, list):
        return data[0] if len(data) > 0 else None
    # otherwise unknown type
    return None


def _extract_user_id_from_claims(claims):
    """
    Defensive extraction for user_id from various claim shapes:
    - claims might be: {"user_id": 31} or {"user_id": {"user_id":31}} etc.
    Returns int or None.
    """
    if not isinstance(claims, dict):
        return None
    uid_field = claims.get("user_id") or claims.get("id") or claims.get("uid")
    if uid_field is None:
        return None
    # handle nested dict like {"user_id": {"user_id": 31}}
    if isinstance(uid_field, dict):
        # try common keys
        for k in ("user_id", "id", "uid"):
            if k in uid_field:
                return _extract_user_id_from_claims({k: uid_field[k]})
        # fallback: take the only value
        if len(uid_field) == 1:
            (v,) = uid_field.values()
            return int(v) if isinstance(v, (int, str)) and str(v).isdigit() else None
        return None
    # finally, convert strings to int if possible
    if isinstance(uid_field, int):
        return uid_field
    if isinstance(uid_field, str) and uid_field.isdigit():
        return int(uid_field)
    return None


def simulate_hardhat_transaction(tx_hash, from_address=None):
    """
    Simulate a hardhat transaction record for demo/testing.
    Returns a dict matching the shape used in the code.
    """
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
        "value": w3.to_wei(PING_COST_ETH, "ether"),
        "gas_used": gas_used,
        "block_number": block_number,
        "status": 1,
        "timestamp": int(time.time()),
    }


# -------------------------
# CRUD endpoints
# -------------------------
@ping_controller.route('/', methods=['POST'])
def create_ping():
    data = request.json or {}
    res = ping_model.create_ping(
        data.get("wid"),
        data.get("is_up"),
        data.get("latency_ms"),
        data.get("region"),
        data.get("uid"),
        data.get("tx_hash"),
        data.get("fee_paid_numeric"),
    )
    return jsonify(_unwrap_supabase_response(res)), 201


@ping_controller.route('/', methods=['GET'])
def list_pings():
    return jsonify(_unwrap_supabase_response(ping_model.get_all_pings())), 200


@ping_controller.route('/<int:pid>', methods=['GET'])
def get_ping(pid):
    return jsonify(_unwrap_supabase_response(ping_model.get_ping_by_id(pid))), 200


@ping_controller.route('/<int:pid>', methods=['PUT'])
def update_ping(pid):
    data = request.json or {}
    return jsonify(_unwrap_supabase_response(ping_model.update_ping(pid, data))), 200


@ping_controller.route('/<int:pid>', methods=['DELETE'])
def delete_ping(pid):
    ping_model.delete_ping(pid)
    return jsonify({"message": "Deleted"}), 200


# -------------------------
# Manual ping (Hardhat simulate or real tx variant)
# -------------------------
@ping_controller.route('/manual', methods=['POST'])
def manual_ping():
    """
    Manual ping flow (defensive):
    - Authenticate via JWT (token required)
    - Use token's user_id (do NOT trust uid in body)
    - Required body: wid, url, tx_hash (tx_hash may be a fake code from FAKE_TX_CODES for local testing)
    - Validate user exists
    - Ensure tx_hash not used before
    - Simulate or verify on-chain tx (we simulate for Hardhat demo)
    - Call configured agent/worker to perform the actual ping
    - Persist ping and on-chain tx record
    """
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

    data = request.get_json(silent=True) or {}
    wid = data.get("wid")
    url = data.get("url")
    tx_hash = data.get("tx_hash")

    if not (wid and url and tx_hash):
        return jsonify({"error": "wid, url and tx_hash are required"}), 400

    # --- get user row (defensive) ---
    user_row = _get_single_record(user_model.get_user_by_id(uid))
    if not user_row:
        return jsonify({"error": "User not found"}), 404

    # --- ensure tx not already recorded ---
    existing_tx = _get_single_record(tx_model.get_transaction_by_hash(tx_hash))
    if existing_tx:
        return jsonify({"error": "Transaction code already used", "tx_hash": tx_hash}), 409

    # --- process transaction (simulate for Hardhat flow) ---
    if tx_hash in FAKE_TX_CODES:
        simulated_tx = simulate_hardhat_transaction(tx_hash)
        if simulated_tx is None:
            return jsonify({"error": "Failed to simulate transaction"}), 500
        used_amount_eth = PING_COST_ETH
        gas_used = simulated_tx["gas_used"]
    else:
        # If you want to verify a real on-chain tx (not simulated) implement here:
        # - use w3.eth.get_transaction_receipt(tx_hash) etc.
        return jsonify({"error": "Only simulated tx codes are supported in local mode"}), 400

    # --- call user's agent/worker to actually ping the URL ---
    agent_url = user_row.get("agent_url")
    if not agent_url:
        return jsonify({"error": "No agent_url configured for user"}), 400

    try:
        resp = requests.post(agent_url, json={"url": url}, timeout=20)
        resp.raise_for_status()
        result = resp.json()
    except Exception as e:
        return jsonify({"error": f"Worker error: {str(e)}"}), 502

    # --- persist ping ---
    ping_resp = ping_model.create_ping(
        wid=wid,
        is_up=result.get("is_up", False),
        latency_ms=result.get("latency_ms"),
        region=result.get("region", "cloudflare-edge"),
        uid=uid,
        tx_hash=tx_hash,
        fee_paid_numeric=used_amount_eth,
    )
    ping_row = _get_single_record(ping_resp)
    if not ping_row:
        return jsonify({"error": "Failed to save ping"}), 500

    # --- persist on-chain transaction (simulated) ---
    tx_model.create_transaction(
        tx_hash=tx_hash,
        uid=uid,
        pid=ping_row.get("pid"),
        token_address="ETH",
        token_amount=used_amount_eth,
        gas_used=gas_used,
    )

    return jsonify({
        "status": "recorded",
        "ping": ping_row,
        "onchain": {
            "tx_hash": tx_hash,
            "amount": used_amount_eth,
            "gas_used": gas_used,
            "simulated": True
        },
        "result": result
    }), 200


# -------------------------
# Wallet endpoints (simulated)
# -------------------------
@ping_controller.route('/wallet/balance', methods=['GET'])
def get_wallet_balance():
    """
    Simulated wallet balance: sums token_amount from user's onchain transactions.
    Returns a fake starting balance minus spent.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth.split(" ", 1)[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid/expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    try:
        txns = _unwrap_supabase_response(tx_model.get_transactions_by_user(uid)) or []
        # txns might be a list of dicts
        total_spent = sum(float(t.get("token_amount", 0)) for t in txns if isinstance(t, dict))
        starting_balance = 1.0
        current_balance = max(0.0, starting_balance - total_spent)
        user_row = _get_single_record(user_model.get_user_by_id(uid)) or {}
        wallet_address = user_row.get("wallet_address") or random.choice(HARDHAT_ACCOUNTS)
        return jsonify({
            "wallet_address": wallet_address,
            "eth_balance": f"{current_balance:.6f}",
            "usd_value": f"{current_balance * 2000:.2f}",
            "total_spent": f"{total_spent:.6f}",
            "total_pings": len(txns),
            "simulated": True
        }), 200
    except Exception as e:
        print("Error in get_wallet_balance:", e)
        return jsonify({"error": "Failed to compute wallet balance"}), 500


@ping_controller.route('/wallet/transactions', methods=['GET'])
def get_transaction_history():
    """
    Returns formatted transaction history for authenticated user.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth.split(" ", 1)[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid/expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    try:
        txns = _unwrap_supabase_response(tx_model.get_transactions_by_user(uid)) or []
        formatted = []
        for tx in txns:
            if not isinstance(tx, dict):
                continue
            formatted.append({
                "tx_hash": tx.get("tx_hash"),
                "amount": tx.get("token_amount"),
                "timestamp": tx.get("created_at") or datetime.now().isoformat(),
                "status": "success",
                "type": "ping_payment"
            })
        return jsonify({"transactions": formatted, "total_count": len(formatted)}), 200
    except Exception as e:
        print("Error in get_transaction_history:", e)
        return jsonify({"error": "Failed to get transaction history"}), 500


@ping_controller.route('/network/status', methods=['GET'])
def get_network_status():
    try:
        return jsonify({
            "connected": True,
            "chain_id": 31337,
            "network_name": "Hardhat Local",
            "rpc_url": os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545"),
            "contract_address": CONTRACT_ADDRESS,
            "ping_cost_eth": PING_COST_ETH,
            "available_tx_codes": len(FAKE_TX_CODES),
            "simulated": True
        }), 200
    except Exception as e:
        print("Error in get_network_status:", e)
        return jsonify({"error": "Failed to get network status"}), 500
