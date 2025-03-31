from flask import Blueprint
from controllers.auth_controller import AuthController

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/webhook', methods=['POST'])
def clerk_webhook():
    return AuthController.handle_webhook()

@auth_routes.route('/verify', methods=['POST'])
def verify_token():
    return AuthController.verify_token()

