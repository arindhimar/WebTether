from flask import Blueprint
from controllers.user_controller import UserController
from middleware.auth_middleware import token_required

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('', methods=['POST'])
def create_user():
    return UserController.create_user()

@user_routes.route('/<string:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    return UserController.get_user(user_id)

@user_routes.route('/<string:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    return UserController.update_user(user_id)

@user_routes.route('/<string:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    return UserController.delete_user(user_id)

@user_routes.route('/clerk/<string:clerk_id>', methods=['GET'])
def get_user_by_clerk_id(clerk_id):
    return UserController.get_user_by_clerk_id(clerk_id)

