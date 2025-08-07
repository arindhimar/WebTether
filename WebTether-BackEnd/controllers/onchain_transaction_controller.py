from flask import Blueprint, request, jsonify
from models.onchain_transaction_model import OnChainTransactionModel

onchain_transaction_controller = Blueprint("onchain_transaction_controller", __name__)
model = OnChainTransactionModel()


@onchain_transaction_controller.route("/", methods=["POST"])
def create_onchain_transaction():
    """
    Create a new on-chain transaction record.
    Expects: tx_hash, uid, token_address, token_amount
    Optional: pid, gas_used
    """
    data = request.get_json(silent=True) or {}

    tx_hash = data.get("tx_hash")
    uid = data.get("uid")
    pid = data.get("pid")  # Optional
    token_address = data.get("token_address")
    token_amount = data.get("token_amount")
    gas_used = data.get("gas_used")

    # Validate required fields
    if not all([tx_hash, uid, token_address, token_amount]):
        return jsonify({"error": "Missing required fields: tx_hash, uid, token_address, token_amount"}), 400

    # Create record
    result = model.create_transaction(
        tx_hash=tx_hash,
        uid=uid,
        pid=pid,
        token_address=token_address,
        token_amount=token_amount,
        gas_used=gas_used
    )

    return jsonify(result.data[0]), 201
