from flask import Blueprint, request, jsonify
from models.website_model import WebsiteModel

website_controller = Blueprint("website_controller", __name__)
website_model = WebsiteModel()

@website_controller.route('/website', methods=['POST'])
def create_website():
    data = request.json
    res = website_model.create_website(
        data["url"],
        data["uid"],
        data.get("category"),
        data.get("status")
    )
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
