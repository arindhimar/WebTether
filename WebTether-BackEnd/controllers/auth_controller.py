# controllers/auth_controller.py
"""
Auth controller (Flask blueprint) for signup/login and simple auth CRUD.

Production-minded behavior:
- Validate inputs strictly
- Roll back created user if auth creation fails (to avoid orphan users)
- Use consistent error codes and JSON shapes
- Minimal leaking of internal errors; log/return helpful messages for dev mode
"""

from flask import Blueprint, request, jsonify
from models.auth_model import AuthModel
from models.user_model import UserModel
from utils.jwt_utils import generate_token
import traceback

auth_controller = Blueprint("auth_controller", __name__)
auth_model = AuthModel()
user_model = UserModel()


def _unwrap_supabase_data(resp):
    """Return resp.data if present, else resp (defensive)."""
    if resp is None:
        return None
    if hasattr(resp, "data"):
        return resp.data
    return resp


@auth_controller.route('/signup', methods=['POST'])
def signup():
    """
    Signup flow:
    - Expect JSON: { name, email, password, isVisitor?, secret_key?, agent_url?, wallet_address? }
    - Create user row first (so user.id exists)
    - Create auth row referencing user.id
    - If auth creation fails, delete the user (rollback)
    - Return created user summary and session token
    """
    data = request.get_json(silent=True) or {}
    required = ("name", "email", "password")
    for k in required:
        if not data.get(k):
            return jsonify({"error": f"Missing required field: {k}"}), 400

    # prepare user payload - pass fields user_model expects (defensive naming)
    try:
        user_res = user_model.create_user(
            name=data["name"],
            is_visitor=data.get("isVisitor", False),
            secret_key=data.get("secret_key"),
            agent_url=data.get("agent_url"),
            wallet_address=data.get("wallet_address")
        )
    except Exception as e:
        # Database insertion failed
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to create user: {str(e)}", "trace": tb}), 500

    user_data = _unwrap_supabase_data(user_res)
    # supabase .insert returns list, e.g. [ { ... } ]
    if not user_data or len(user_data) == 0:
        return jsonify({"error": "Failed to create user (empty response)"}), 500

    # pick first created user record
    user_row = user_data[0]

    # now create auth row referencing created user's id
    try:
        auth_res = auth_model.create_auth(
            data["email"],
            data["password"],
            user_row.get("id")
        )
    except ValueError as e:
        # auth creation failed (e.g. duplicate email) -> rollback user
        try:
            user_model.delete_user(user_row.get("id"))
        except Exception:
            # If rollback fails, just log; return error to client
            pass
        return jsonify({"error": f"Failed to create auth: {str(e)}"}), 400
    except Exception as e:
        # unknown error - rollback and return 500
        try:
            user_model.delete_user(user_row.get("id"))
        except Exception:
            pass
        tb = traceback.format_exc()
        return jsonify({"error": f"Unexpected error creating auth: {str(e)}", "trace": tb}), 500

    auth_data = _unwrap_supabase_data(auth_res)
    if not auth_data or len(auth_data) == 0:
        # rollback user
        try:
            user_model.delete_user(user_row.get("id"))
        except Exception:
            pass
        return jsonify({"error": "Failed to create auth (empty response)"}), 500

    # Create session token
    session_token = generate_token({"user_id": user_row.get("id")})

    response = {
        "user": {
            "id": user_row.get("id"),
            "name": user_row.get("name"),
            "isVisitor": user_row.get("isVisitor") if "isVisitor" in user_row else user_row.get("is_visitor")
        },
        "session": {
            "token": session_token,
            "expires_in": 24 * 3600
        }
    }
    return jsonify(response), 201


@auth_controller.route('/login', methods=['POST'])
def login():
    """
    Login flow:
    - Expect JSON: { email, password }
    - Use AuthModel.sign_in to validate credentials
    - On success: fetch user by user_id and return user summary + token
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    auth_res = auth_model.sign_in(email, password)
    if auth_res.get("status") != "success":
        # Keep reason generic but return what sign_in said (useful for debugging)
        return jsonify({"error": auth_res.get("reason", "Invalid credentials")}), 401

    # auth_res['user'] should contain fields including user_id (FK)
    auth_user = auth_res.get("user")
    # auth_user may be a list or dict depending on supabase response - handle common shapes
    if isinstance(auth_user, list) and len(auth_user) > 0:
        auth_user = auth_user[0]
    if not isinstance(auth_user, dict):
        # If auth returned supabase object with .data, handle that
        # but sign_in returns dict containing the row; handle defensively
        pass

    user_id = auth_user.get("user_id") or auth_user.get("uid") or auth_user.get("user") or auth_user.get("id")
    # attempt to fetch user row
    try:
        user_res = user_model.get_user_by_id(user_id)
    except Exception as e:
        return jsonify({"error": f"User retrieval failed: {e}"}), 500

    user_row = _unwrap_supabase_data(user_res)
    if isinstance(user_row, list) and len(user_row) > 0:
        user_row = user_row[0]

    if not user_row:
        return jsonify({"error": "User not found"}), 404

    session_token = generate_token({
        "user_id": user_row.get("id"),
        "email": email
    })

    return jsonify({
        "user": {
            "id": user_row.get("id"),
            "name": user_row.get("name"),
            "isVisitor": user_row.get("isVisitor") if "isVisitor" in user_row else user_row.get("is_visitor"),
            "role": user_row.get("role")
        },
        "token": session_token
    }), 200


@auth_controller.route('/', methods=['GET'])
def list_auths():
    """List all auth rows (admin use). In production this should be protected by admin-only checks."""
    try:
        res = auth_model.get_all_auths()
        return jsonify(_unwrap_supabase_data(res)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to list auths: {str(e)}"}), 500


@auth_controller.route('/<int:auth_id>', methods=['GET'])
def get_auth(auth_id):
    try:
        res = auth_model.get_auth_by_id(auth_id)
        return jsonify(_unwrap_supabase_data(res)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to get auth: {str(e)}"}), 500


@auth_controller.route('/<int:auth_id>', methods=['PUT'])
def update_auth(auth_id):
    data = request.get_json(silent=True) or {}
    try:
        res = auth_model.update_auth(auth_id, data)
        return jsonify(_unwrap_supabase_data(res)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update auth: {str(e)}"}), 500


@auth_controller.route('/<int:auth_id>', methods=['DELETE'])
def delete_auth(auth_id):
    try:
        res = auth_model.delete_auth(auth_id)
        return jsonify({"message": "Deleted", "result": _unwrap_supabase_data(res)}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete auth: {str(e)}"}), 500
