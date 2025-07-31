from flask import Blueprint, request, jsonify
from models.user_model import UserModel

user_controller = Blueprint("user_controller", __name__)
user_model = UserModel()

@user_controller.route('/users', methods=['POST'])
def create_user():
    data = request.json
    res = user_model.create_user(data["name"], data.get("isVisitor"), data.get("secret_key"))
    return jsonify(res.data), 201

@user_controller.route('/users', methods=['GET'])
def list_users():
    return jsonify(user_model.get_all_users().data), 200

@user_controller.route('/users/<int:uid>', methods=['GET'])
def get_user(uid):
    return jsonify(user_model.get_user_by_id(uid).data), 200

@user_controller.route('/users/<int:uid>', methods=['PUT'])
def update_user(uid):
    data = request.json
    return jsonify(user_model.update_user(uid, data).data), 200

@user_controller.route('/users/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    user_model.delete_user(uid)
    return jsonify({"message": "Deleted"}), 200

