from flask import Blueprint, request, jsonify
from models.ping_model import PingModel
from models.user_model import UserModel
from models.onchain_transaction_model import OnChainTransactionModel
from utils.jwt_utils import decode_token
from web3 import Web3
from datetime import datetime
import os, requests, time, random

# Initialize Blueprint and models
ping_controller = Blueprint("ping_controller", __name__)
ping_model = PingModel()
user_model = UserModel()
tx_model = OnChainTransactionModel()

# Hardhat simulation config
w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_RPC_URL", "http://127.0.0.1:8545")))
CONTRACT_ADDRESS = os.getenv("PING_PAYMENT_CONTRACT", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
PING_COST_ETH = 0.0002
FAKE_TX_CODES = [f"TX-{str(i+1).zfill(3)}" for i in range(20)]
HARDHAT_ACCOUNTS = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
]

def simulate_hardhat_transaction(tx_hash: str, from_address: str = None) -> dict | None:
    """Simulate a Hardhat blockchain transaction using a fake tx_hash."""
    if tx_hash not in FAKE_TX_CODES:
        return None
    return {
        "hash": tx_hash,
        "from": from_address or random.choice(HARDHAT_ACCOUNTS),
        "to": CONTRACT_ADDRESS,
        "value": w3.to_wei(PING_COST_ETH, 'ether'),
        "gas_used": random.randint(21000, 50000),
        "block_number": random.randint(1000, 9999),
        "status": 1,
        "timestamp": int(time.time())
    }

# ----------------- Ping Routes -----------------

@ping_controller.route('/', methods=['POST'])
def create_ping():
    """Create a ping manually without simulation (primarily admin/debug)."""
    data = request.get_json()
    result = ping_model.create_ping(
        wid=data["wid"],
        is_up=data["is_up"],
        latency_ms=data.get("latency_ms"),
        region=data.get("region"),
        uid=data.get("uid"),
        tx_hash=data.get("tx_hash"),
        fee_paid_numeric=data.get("fee_paid_numeric")
    )
    return jsonify(result.data), 201

@ping_controller.route('', methods=['GET'])
def list_pings():
    """List all ping records."""
    return jsonify(ping_model.get_all_pings().data), 200

@ping_controller.route('/<int:pid>', methods=['GET'])
def get_ping(pid):
    """Fetch a specific ping by ID."""
    return jsonify(ping_model.get_ping_by_id(pid).data), 200

@ping_controller.route('/manual', methods=['POST'])
def manual_ping():
    """Handle a manual ping that simulates a blockchain payment."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid auth header"}), 401

    claims = decode_token(auth_header.split(" ", 1)[1])
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims["user_id"]
    data = request.get_json(silent=True) or {}
    wid, url, tx_hash = data.get("wid"), data.get("url"), data.get("tx_hash")

    if not all([wid, url, tx_hash]):
        return jsonify({"error": "wid, url and tx_hash are required"}), 400

    # Verify user
    user = user_model.get_user_by_id(uid).data
    if not user:
        return jsonify({"error": "User not found"}), 404

    if tx_hash not in FAKE_TX_CODES:
        return jsonify({"error": f"Invalid tx_hash. Must be one of: {', '.join(FAKE_TX_CODES)}"}), 400

    if tx_model.get_transaction_by_hash(tx_hash):
        return jsonify({"error": "Transaction code already used", "tx_hash": tx_hash}), 409

    simulated_tx = simulate_hardhat_transaction(tx_hash)
    if not simulated_tx:
        return jsonify({"error": "Failed to simulate transaction"}), 500

    agent_url = user.get("agent_url")
    if not agent_url:
        return jsonify({"error": "No agent_url configured"}), 400

    # Perform the ping via Cloudflare Worker
    try:
        response = requests.post(agent_url, json={"url": url}, timeout=10)
        response.raise_for_status()
        ping_result = response.json()
    except Exception as e:
        return jsonify({"error": f"Cloudflare ping error: {str(e)}"}), 502

    # Save ping in DB
    ping_record = ping_model.create_ping(
        wid=wid,
        is_up=ping_result.get("is_up", False),
        latency_ms=ping_result.get("latency_ms"),
        region=ping_result.get("region", "cloudflare-edge"),
        uid=uid,
        tx_hash=tx_hash,
        fee_paid_numeric=PING_COST_ETH
    ).data[0]

    # Save on-chain tx
    tx_model.create_transaction(
        tx_hash=tx_hash,
        uid=uid,
        pid=ping_record["pid"],
        token_address="ETH",
        token_amount=PING_COST_ETH,
        gas_used=simulated_tx["gas_used"]
    )

    return jsonify({
        "status": "recorded",
        "ping": ping_record,
        "onchain": {
            "tx_hash": tx_hash,
            "amount": PING_COST_ETH,
            "gas_used": simulated_tx["gas_used"],
            "block_number": simulated_tx["block_number"],
            "simulated": True
        },
        "result": ping_result
    }), 200

# ----------------- Wallet Routes -----------------

@ping_controller.route('/wallet/balance', methods=['GET'])
def get_wallet_balance():
    """Get the simulated ETH balance for the current user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid auth header"}), 401

    claims = decode_token(auth_header.split(" ", 1)[1])
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims["user_id"]
    user = user_model.get_user_by_id(uid).data
    if not user:
        return jsonify({"error": "User not found"}), 404

    txns = tx_model.get_transactions_by_user(uid)
    total_spent = sum(float(tx.get("token_amount", 0)) for tx in txns)
    starting_balance = 1.0
    current_balance = max(0, starting_balance - total_spent)

    return jsonify({
        "wallet_address": user.get("wallet_address") or random.choice(HARDHAT_ACCOUNTS),
        "eth_balance": f"{current_balance:.4f}",
        "usd_value": f"{current_balance * 2000:.2f}",
        "total_spent": f"{total_spent:.4f}",
        "total_pings": len(txns),
        "starting_balance": f"{starting_balance:.4f}",
        "simulated": True
    }), 200

@ping_controller.route('/wallet/transactions', methods=['GET'])
def get_transaction_history():
    """Get the transaction history for the current user."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid auth header"}), 401

    claims = decode_token(auth_header.split(" ", 1)[1])
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims["user_id"]
    txns = tx_model.get_transactions_by_user(uid)

    formatted = [{
        "tx_hash": tx.get("tx_hash"),
        "amount": tx.get("token_amount"),
        "timestamp": tx.get("created_at", datetime.now().isoformat()),
        "status": "success",
        "type": "ping_payment"
    } for tx in txns]

    return jsonify({
        "transactions": formatted,
        "total_count": len(formatted)
    }), 200

@ping_controller.route('/network/status', methods=['GET'])
def get_network_status():
    """Return the Hardhat simulation network status."""
    try:
        return jsonify({
            "connected": True,
            "chain_id": 31337,
            "network_name": "Hardhat Local",
            "rpc_url": "http://127.0.0.1:8545",
            "contract_address": CONTRACT_ADDRESS,
            "ping_cost_eth": PING_COST_ETH,
            "available_tx_codes": len(FAKE_TX_CODES),
            "simulated": True
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to get network status: {str(e)}"}), 500
