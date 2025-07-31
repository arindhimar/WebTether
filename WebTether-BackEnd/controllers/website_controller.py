from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel
from utils.jwt_utils import decode_token

website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()

@website_controller.route('/websites/website', methods=['POST'])
def create_website():
    data = request.json
    res = website_model.create_website(data["url"], data["uid"], data.get("category"))
    return jsonify(res.data), 201

@website_controller.route('/websites/website', methods=['GET'])
def list_websites():
    res = website_model.get_all_websites()
    return jsonify(res.data), 200

@website_controller.route('/websites/website/<int:wid>', methods=['GET'])
def get_website(wid):
    res = website_model.get_website_by_id(wid)
    return jsonify(res.data), 200

@website_controller.route('/websites/website/<int:wid>', methods=['PUT'])
def update_website(wid):
    data = request.json
    res = website_model.update_website(wid, data)
    return jsonify(res.data), 200

@website_controller.route('/websites/website/<int:wid>', methods=['DELETE'])
def delete_website(wid):
    website_model.delete_website(wid)
    return jsonify({"message": "Deleted"}), 200

@website_controller.route('/websites/available-sites', methods=['GET'])
def get_available_sites():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    claims = decode_token(token)
    current_uid = claims.get("user_id")

    res = website_model.get_websites_excluding_user(current_uid)
    return jsonify(res.data), 200
