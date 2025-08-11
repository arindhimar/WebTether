# controllers/website_controller.py
"""
Website controller
- Creates/list/updates/deletes websites
- Provides `available-sites` endpoint which returns websites NOT owned by the
  authenticated user.
This file is defensive: it normalizes JWT claims and normalizes model responses
so differences between returning supabase response objects vs raw lists are handled.
"""

from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel
from utils.jwt_utils import decode_token

website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()


def _normalize_user_id(uid_field):
    """
    Normalize user_id values we might find in JWT claims.
    Accepts:
      - int
      - numeric string
      - dict like {"user_id": 31} or {"id": 31}
    Returns int or raises ValueError.
    """
    if isinstance(uid_field, int):
        return uid_field
    if isinstance(uid_field, str):
        try:
            return int(uid_field)
        except ValueError:
            raise ValueError("user_id string is not numeric")
    if isinstance(uid_field, dict):
        for k in ("user_id", "id", "uid"):
            if k in uid_field:
                return _normalize_user_id(uid_field[k])
        # if single-item dict, try that value
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


def _unwrap_supabase_response(resp):
    """
    Supabase client execute() usually returns an object with .data attribute.
    But some model helper functions may be returning .data already or plain lists.
    This function returns a plain python structure (list/dict) suitable for jsonify.
    """
    if resp is None:
        return []
    # If user returned a supabase 'Response' object with .data attribute
    if hasattr(resp, "data"):
        return resp.data or []
    # Already a list/dict
    return resp


@website_controller.route('/', methods=['POST'])
def create_website():
    # Require Authorization header and extract user id from JWT
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = _extract_user_id_from_claims(claims)
    if uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    data = request.json or {}
    url = data.get("url")
    category = data.get("category")

    if not url:
        return jsonify({"error": "Missing website URL"}), 400

    # Create website record as the authenticated user
    res = website_model.create_website(url, uid, category)
    # normalize response
    payload = _unwrap_supabase_response(res)
    return jsonify(payload), 201


@website_controller.route('/', methods=['GET'])
def list_websites():
    res = website_model.get_all_websites()
    return jsonify(_unwrap_supabase_response(res)), 200


@website_controller.route('/<int:wid>', methods=['GET'])
def get_website(wid):
    res = website_model.get_website_by_id(wid)
    return jsonify(_unwrap_supabase_response(res)), 200


@website_controller.route('/<int:wid>', methods=['PUT'])
def update_website(wid):
    data = request.json or {}
    res = website_model.update_website(wid, data)
    return jsonify(_unwrap_supabase_response(res)), 200


@website_controller.route('/<int:wid>', methods=['DELETE'])
def delete_website(wid):
    website_model.delete_website(wid)
    return jsonify({"message": "Deleted"}), 200


@website_controller.route('/available-sites', methods=['GET'])
def get_available_sites():
    """
    Return websites not owned by the authenticated user.
    Defensive: normalize JWT -> user_id and normalize model response.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    current_uid = _extract_user_id_from_claims(claims)
    if current_uid is None:
        return jsonify({"error": "Invalid user id in token"}), 400

    # Ask model for available sites. model may return supabase response or list
    result = website_model.get_available_sites_for_user(current_uid)
    data = _unwrap_supabase_response(result)
    return jsonify(data), 200
