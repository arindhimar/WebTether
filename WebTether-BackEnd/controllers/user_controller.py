# controllers/user_controller.py
"""
User controller (Flask blueprint)

- Provides simple, well-documented endpoints for user CRUD.
- Validates input and normalizes Supabase responses to plain JSON structures.
- Uses defensive programming: returns clear HTTP errors for invalid input and handles Supabase shapes.
- Note: In production you should protect sensitive endpoints with role checks / admin guard.
"""

from flask import Blueprint, request, jsonify
from models.user_model import UserModel
import traceback

user_controller = Blueprint("user_controller", __name__)
user_model = UserModel()


def _unwrap_supabase_response(resp):
    """
    Convert a Supabase response object (with .data) into native Python data.
    If resp is already a dict/list, return it unchanged.
    """
    if resp is None:
        return None
    if hasattr(resp, "data"):
        return resp.data
    return resp


def _single_record_from_response(resp):
    """
    Return a single record (dict) from a supabase response or list/dict.
    - If resp.data is a list -> return first item or None
    - If resp.data is a dict -> return it
    - If resp is a dict -> return it
    """
    data = _unwrap_supabase_response(resp)
    if data is None:
        return None
    if isinstance(data, dict):
        return data
    if isinstance(data, list):
        return data[0] if len(data) > 0 else None
    return None


# -----------------------
# Routes
# -----------------------
@user_controller.route('/', methods=['POST'])
def create_user():
    """
    Create a user.
    Expected JSON:
      { name, isVisitor?, secret_key?, agent_url?, wallet_address?, role?, balance_numeric? }
    """
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    if not name:
        return jsonify({"error": "Missing required field: name"}), 400

    try:
        resp = user_model.create_user(
            name=name,
            is_visitor=data.get("isVisitor", False),
            secret_key=data.get("secret_key"),
            agent_url=data.get("agent_url"),
            wallet_address=data.get("wallet_address"),
            role=data.get("role"),
            balance_numeric=data.get("balance_numeric")
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to create user: {e}", "trace": tb}), 500

    created = _unwrap_supabase_response(resp)
    return jsonify(created), 201


@user_controller.route('/', methods=['GET'])
def list_users():
    """
    Return all users.
    NOTE: In production this should be admin-only and paginated.
    """
    try:
        resp = user_model.get_all_users()
        data = _unwrap_supabase_response(resp)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to list users: {str(e)}"}), 500


@user_controller.route('/<int:uid>', methods=['GET'])
def get_user(uid):
    """
    Get user details by id.
    """
    try:
        resp = user_model.get_user_by_id(uid)
        user = _single_record_from_response(resp)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user: {str(e)}"}), 500


@user_controller.route('/<int:uid>', methods=['PUT'])
def update_user(uid):
    """
    Update user record.
    Accepts subset of fields: name, isVisitor, secret_key, agent_url, wallet_address, role, balance_numeric
    """
    data = request.get_json(silent=True) or {}
    try:
        resp = user_model.update_user(uid, data)
        updated = _unwrap_supabase_response(resp)
        return jsonify(updated), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to update user: {e}", "trace": tb}), 500


@user_controller.route('/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    """
    Delete user by id.
    NOTE: In production you may wish to soft-delete (mark as deactivated) and cascade cleanup.
    """
    try:
        resp = user_model.delete_user(uid)
        return jsonify({"message": "Deleted", "result": _unwrap_supabase_response(resp)}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500
