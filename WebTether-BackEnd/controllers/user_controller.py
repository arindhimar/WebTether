from flask import Blueprint, request, jsonify
from models.user_model import UserModel

user_controller = Blueprint("user_controller", __name__)
user_model = UserModel()

@user_controller.route('/users', methods=['POST'])
def create_user():
    data = request.json
    result = user_model.create_user(
        name=data["name"],
        is_visitor=data.get("isVisitor", False),
        secret_key=data.get("secret_key"),
        replit_agent_url=data.get("replit_agent_url"),
        replit_agent_token=data.get("replit_agent_token")
    )
    return jsonify(result.data), 201

@user_controller.route('/users', methods=['GET'])
def get_all_users():
    return jsonify(user_model.get_all_users().data), 200

@user_controller.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify(user_model.get_user_by_id(user_id).data), 200

@user_controller.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    return jsonify(user_model.update_user(user_id, data).data), 200

@user_controller.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user_model.delete_user(user_id)
    return jsonify({"message": "Deleted"}), 200
