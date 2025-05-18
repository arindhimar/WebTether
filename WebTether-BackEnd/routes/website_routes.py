from flask import Blueprint
from controllers.website_controller import WebsiteController
from middleware.auth_middleware import token_required

website_routes = Blueprint('website_routes', __name__)

@website_routes.route('', methods=['GET'])
@token_required
def get_all_websites():
    return WebsiteController.get_all_websites()

@website_routes.route('', methods=['POST'])
@token_required
def create_website():
    return WebsiteController.create_website()

@website_routes.route('/<string:website_id>', methods=['GET'])
@token_required
def get_website(website_id):
    return WebsiteController.get_website(website_id)

@website_routes.route('/<string:website_id>', methods=['PUT'])
@token_required
def update_website(website_id):
    return WebsiteController.update_website(website_id)

@website_routes.route('/<string:website_id>', methods=['DELETE'])
@token_required
def delete_website(website_id):
    return WebsiteController.delete_website(website_id)

@website_routes.route('/stats', methods=['GET'])
@token_required
def get_website_stats():
    return WebsiteController.get_website_stats()

# Toggle website public status
@website_routes.route('/<string:website_id>/toggle-public', methods=['POST'])
@token_required
def toggle_public_status(website_id):
    return WebsiteController.toggle_public_status(website_id)
