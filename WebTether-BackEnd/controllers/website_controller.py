from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel
from utils.jwt_utils import decode_token

website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()

@website_controller.route('/website', methods=['POST'])
def create_website():
    # 1. Decode the JWT to get the user ID
    auth_header = request.headers.get("Authorization", "")
    # print(auth_header)
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    print(decode_token(token))
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    uid = claims.get("user_id")

    # 2. Read the URL and optional category from the body
    data = request.json or {}
    url = data.get("url")
    category = data.get("category")

    if not url:
        return jsonify({"error": "Missing website URL"}), 400

    # 3. Create the website record using the authenticated user ID
    res = website_model.create_website(url, uid, category)
    return jsonify(res.data), 201

@website_controller.route('/website', methods=['GET'])
def list_websites():
    res = website_model.get_all_websites()
    return jsonify(res.data), 200

@website_controller.route('/website/<int:wid>', methods=['GET'])
def get_website(wid):
    res = website_model.get_website_by_id(wid)
    return jsonify(res.data), 200

@website_controller.route('/website/<int:wid>', methods=['PUT'])
def update_website(wid):
    data = request.json
    res = website_model.update_website(wid, data)
    return jsonify(res.data), 200

@website_controller.route('/website/<int:wid>', methods=['DELETE'])
def delete_website(wid):
    website_model.delete_website(wid)
    return jsonify({"message": "Deleted"}), 200

@website_controller.route('/available-sites', methods=['GET'])
def get_available_sites():
    # 1. Extract and validate the JWT
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.replace("Bearer ", "")
    claims = decode_token(token)
    if not claims:
        return jsonify({"error": "Invalid or expired token"}), 401

    # 2. Fetch sites not owned by this user
    current_uid = claims.get("user_id")
    result = website_model.get_available_sites_for_user(current_uid)

    return jsonify(result.data), 200
