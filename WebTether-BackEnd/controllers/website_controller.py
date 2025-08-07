# controllers/website_controller.py

from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel
from utils.jwt_utils import decode_token

# Blueprint for website-related routes
website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()


@website_controller.route('/website', methods=['POST'])
def create_website():
    """
    🔐 Create a website entry for the authenticated user.
    Required: JWT in Authorization header, JSON { url, category? }
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims.get("user_id")

    # Parse payload
    data = request.get_json(silent=True) or {}
    url = data.get("url")
    category = data.get("category")

    if not url:
        return jsonify({"error": "Missing website URL"}), 400

    res = website_model.create_website(url, uid, category)
    return jsonify(res.data), 201


@website_controller.route('/website', methods=['GET'])
def list_websites():
    """
    ✅ Get all websites (for admin/debug use)
    """
    res = website_model.get_all_websites()
    return jsonify(res.data), 200


@website_controller.route('/website/<int:wid>', methods=['GET'])
def get_website(wid):
    """
    ✅ Get details of a website by ID
    """
    res = website_model.get_website_by_id(wid)
    if res.data is None:
        return jsonify({"error": "Website not found"}), 404
    return jsonify(res.data), 200


@website_controller.route('/website/<int:wid>', methods=['PUT'])
def update_website(wid):
    """
    🔐 Update website info by ID
    """
    data = request.get_json(silent=True) or {}
    allowed_fields = {"url", "category", "status"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    res = website_model.update_website(wid, update_data)
    return jsonify(res.data), 200


@website_controller.route('/website/<int:wid>', methods=['DELETE'])
def delete_website(wid):
    """
    ⚠️ Delete a website by ID
    """
    website_model.delete_website(wid)
    return jsonify({"message": "Website deleted"}), 200


@website_controller.route('/available-sites', methods=['GET'])
def get_available_sites():
    """
    🔐 Get websites not owned by the current user.
    Useful for pinging others' sites.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    current_uid = claims.get("user_id")
    result = website_model.get_available_sites_for_user(current_uid)

    return jsonify(result.data), 200
