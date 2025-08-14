# controllers/website_controller.py
"""
Website controller (Flask blueprint)

Endpoints:
 - POST   /websites          -> create website (auth required)
 - GET    /websites         -> list all websites (public; consider pagination)
 - GET    /websites/<wid>    -> get website by id
 - PUT    /websites/<wid>    -> update website (owner only)
 - DELETE /websites/<wid>    -> delete website (owner only)
 - GET    /websites/available-sites  -> list sites not owned by current user (auth required)

Notes:
 - Uses defensive helpers to normalize Supabase responses.
 - Expects JWT decoding via utils.jwt_utils.decode_token (keeps utils unchanged).
"""

from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel
from models.user_model import UserModel
from utils.jwt_utils import decode_token
import traceback

website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()
user_model = UserModel()


# -------------------------
# Helpers
# -------------------------
def _unwrap_supabase_response(resp):
    """Return resp.data if object has .data, else return resp as-is."""
    if resp is None:
        return None
    if hasattr(resp, "data"):
        return resp.data
    return resp


def _single_record_from_response(resp):
    """Return a single dict record or None from various possible response shapes."""
    data = _unwrap_supabase_response(resp)
    if data is None:
        return None
    if isinstance(data, dict):
        return data
    if isinstance(data, list):
        return data[0] if len(data) > 0 else None
    return None


def _extract_user_id_from_claims(claims):
    """
    Defensive extraction of user id from token claims.
    Accepts shapes like {"user_id": 31} or nested {"user_id": {"user_id": 31}}.
    """
    if not isinstance(claims, dict):
        return None
    uid_field = claims.get("user_id") or claims.get("id") or claims.get("uid")
    if uid_field is None:
        return None
    if isinstance(uid_field, dict):
        for k in ("user_id", "id", "uid"):
            if k in uid_field:
                return _extract_user_id_from_claims({k: uid_field[k]})
        if len(uid_field) == 1:
            (v,) = uid_field.values()
            return int(v) if isinstance(v, (int, str)) and str(v).isdigit() else None
        return None
    if isinstance(uid_field, int):
        return uid_field
    if isinstance(uid_field, str) and uid_field.isdigit():
        return int(uid_field)
    return None


# -------------------------
# Routes
# -------------------------
@website_controller.route('/', methods=['POST'])
def create_website():
    """
    Create a website record. Requires Authorization header (Bearer <token>).
    Request JSON:
      { url: string, category?: string, name?: string, reward_per_ping?: number }

    The owner uid is taken from the JWT (do NOT accept uid from body).
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
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing required field: url"}), 400

    try:
        resp = website_model.create_website(
            url=url,
            uid=uid,
            category=data.get("category"),
            name=data.get("name"),
            reward_per_ping=data.get("reward_per_ping"),
            status=data.get("status")
        )
        return jsonify(_unwrap_supabase_response(resp)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to create website: {e}", "trace": tb}), 500


@website_controller.route('/', methods=['GET'])
def list_websites():
    """
    Public listing of websites.
    In production: add pagination, filtering, caching.
    """
    try:
        resp = website_model.get_all_websites()
        return jsonify(_unwrap_supabase_response(resp)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to list websites: {str(e)}"}), 500


@website_controller.route('/<int:wid>', methods=['GET'])
def get_website(wid):
    try:
        resp = website_model.get_website_by_id(wid)
        rec = _single_record_from_response(resp)
        if not rec:
            return jsonify({"error": "Website not found"}), 404
        return jsonify(rec), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch website: {str(e)}"}), 500


@website_controller.route('/<int:wid>', methods=['PUT'])
def update_website(wid):
    """
    Update website — only owner (or admin) may update.
    Body may include: url, category, status, name, reward_per_ping
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

    # ensure requester is owner of site
    try:
        website_row = _single_record_from_response(website_model.get_website_by_id(wid))
        if not website_row:
            return jsonify({"error": "Website not found"}), 404

        if int(website_row.get("uid")) != int(uid):
            return jsonify({"error": "Forbidden: only owner can update website"}), 403

        data = request.get_json(silent=True) or {}
        resp = website_model.update_website(wid, data)
        return jsonify(_unwrap_supabase_response(resp)), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to update website: {e}", "trace": tb}), 500


@website_controller.route('/<int:wid>', methods=['DELETE'])
def delete_website(wid):
    """
    Delete website — only owner can delete. Consider soft-delete in production.
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

    try:
        website_row = _single_record_from_response(website_model.get_website_by_id(wid))
        if not website_row:
            return jsonify({"error": "Website not found"}), 404

        if int(website_row.get("uid")) != int(uid):
            return jsonify({"error": "Forbidden: only owner can delete website"}), 403

        website_model.delete_website(wid)
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": f"Failed to delete website: {e}", "trace": tb}), 500


@website_controller.route('/available-sites', methods=['GET'])
def get_available_sites():
    """
    Return websites that the authenticated user may validate (not their own).
    Auth required because results are relative to the requester.
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

    try:
        resp = website_model.get_available_sites_for_user(uid)
        return jsonify(_unwrap_supabase_response(resp)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch available sites: {str(e)}"}), 500

@website_controller.route('/user/<int:uid>', methods=['GET'])
def get_user_websites(uid):
    """
    Return websites owned by the specified user.
    """
    try:
        resp = website_model.get_websites_by_user(uid)
        return jsonify(_unwrap_supabase_response(resp)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user websites: {str(e)}"}), 500