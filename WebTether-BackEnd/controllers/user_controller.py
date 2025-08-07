# controllers/user_controller.py

from flask import Blueprint, request, jsonify
from models.user_model import UserModel
from utils.jwt_utils import decode_token

# Initialize blueprint and model
user_controller = Blueprint("user_controller", __name__)
user_model = UserModel()


@user_controller.route('', methods=['POST'])
def create_user():
    """
    ✅ Create a new user (useful for onboarding visitors or agents).
    Accepts: name, isVisitor, secret_key, agent_url, wallet_address
    Returns: Created user object
    """
    data = request.get_json(silent=True) or {}

    required_fields = ['name']
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    res = user_model.create_user(
        name=data["name"],
        is_visitor=data.get("isVisitor", False),
        secret_key=data.get("secret_key"),
        agent_url=data.get("agent_url"),
        wallet_address=data.get("wallet_address")
    )
    return jsonify(res.data), 201


@user_controller.route('', methods=['GET'])
def list_users():
    """
    ✅ Fetch all users (internal use or admin purposes)
    """
    return jsonify(user_model.get_all_users().data), 200


@user_controller.route('/<int:uid>', methods=['GET'])
def get_user(uid):
    """
    ✅ Get user profile by user ID
    """
    user = user_model.get_user_by_id(uid).data
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


@user_controller.route('/me', methods=['GET'])
def get_my_profile():
    """
    🔐 Get authenticated user's profile using JWT token
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Authorization token missing"}), 401

    claims = decode_token(auth.split(" ", 1)[1])
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims.get("user_id")
    user = user_model.get_user_by_id(uid).data
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user}), 200


@user_controller.route('/<int:uid>', methods=['PUT'])
def update_user(uid):
    """
    ✅ Update user by ID (admin or internal use)
    """
    data = request.get_json(silent=True) or {}

    allowed_fields = {"name", "agent_url", "wallet_address", "secret_key", "isVisitor"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields}

    if not filtered_data:
        return jsonify({"error": "No valid fields to update"}), 400

    result = user_model.update_user(uid, filtered_data)
    return jsonify(result.data), 200


@user_controller.route('/me', methods=['PUT'])
def update_my_profile():
    """
    🔐 Update authenticated user's profile
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Authorization token missing"}), 401

    claims = decode_token(auth.split(" ", 1)[1])
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims.get("user_id")
    data = request.get_json(silent=True) or {}

    allowed_fields = {"name", "wallet_address", "agent_url"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    result = user_model.update_user(uid, update_data)
    return jsonify(result.data), 200


@user_controller.route('/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    """
    ⚠️ Delete user by ID (for admin or cleanup operations)
    """
    user_model.delete_user(uid)
    return jsonify({"message": f"User {uid} deleted"}), 200
