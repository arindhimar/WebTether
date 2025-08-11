# controllers/user_controller.py
from flask import Blueprint, request, jsonify
from models.user_model import UserModel
from utils.jwt_utils import decode_token

user_controller = Blueprint("user_controller", __name__)
user_model = UserModel()

@user_controller.route('', methods=['POST'])
def create_user():
    data = request.get_json()
    required_fields = ['name']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing required fields: {', '.join(required_fields)}"}), 400

    try:
        new_user = user_model.create_user(
            name=data['name'],
            is_visitor=data.get('isVisitor', False),
            secret_key=data.get('secret_key'),
            agent_url=data.get('agent_url'),
            wallet_address=data.get('wallet_address')
        )
        return jsonify(new_user), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_controller.route('', methods=['GET'])
def list_users():
    users = user_model.get_all_users()
    return jsonify(users), 200

@user_controller.route('/<int:uid>', methods=['GET'])
def get_user(uid):
    user = user_model.get_user_by_id(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200

@user_controller.route('/me', methods=['GET'])
def get_my_profile():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Authorization token missing"}), 401

    token = auth.split(" ")[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    user = user_model.get_user_by_id(claims['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user), 200

@user_controller.route('/<int:uid>', methods=['PUT'])
def update_user(uid):
    data = request.get_json()
    allowed_fields = {"name", "agent_url", "wallet_address", "secret_key", "isVisitor"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        updated_user = user_model.update_user(uid, update_data)
        return jsonify(updated_user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_controller.route('/me', methods=['PUT'])
def update_my_profile():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Authorization token missing"}), 401

    token = auth.split(" ")[1]
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    data = request.get_json()
    allowed_fields = {"name", "wallet_address", "agent_url"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        updated_user = user_model.update_user(claims['user_id'], update_data)
        return jsonify(updated_user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_controller.route('/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    try:
        user_model.delete_user(uid)
        return jsonify({"message": f"User {uid} deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400