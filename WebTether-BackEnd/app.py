from flask import Flask
from flask_cors import CORS

# Import all controller Blueprints
from controllers.auth_controller import auth_controller
from controllers.user_controller import user_controller
from controllers.website_controller import website_controller
from controllers.ping_controller import ping_controller
from controllers.report_controller import report_controller
from controllers.onchain_transaction_controller import onchain_transaction_controller

def create_app():
    """
    Factory method to create and configure the Flask app.
    """
    app = Flask(__name__)
    CORS(app)

    # Registering all routes
    app.register_blueprint(auth_controller, url_prefix='/auth')
    app.register_blueprint(user_controller, url_prefix='/users')
    app.register_blueprint(website_controller, url_prefix='/websites')
    app.register_blueprint(ping_controller, url_prefix='/pings')
    app.register_blueprint(report_controller, url_prefix='/reports')
    app.register_blueprint(onchain_transaction_controller, url_prefix='/transactions')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
