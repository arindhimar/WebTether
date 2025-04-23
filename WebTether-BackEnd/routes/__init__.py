from flask import Blueprint
from routes.auth_routes import auth_routes
from routes.user_routes import user_routes
from routes.website_routes import website_routes
from routes.report_routes import report_routes
from routes.validator_routes import validator_bp

def register_routes(app):
    """
    Register all route blueprints with the Flask app
    """
    blueprints = [
        (auth_routes, '/api/auth'),
        (user_routes, '/api/users'),
        (website_routes, '/api/websites'),
        (report_routes, '/api/reports'),
        (validator_bp, '/api/validators')
    ]
    
    # Register each blueprint
    for blueprint, url_prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=url_prefix)
    
    print("Registered blueprints:")
    for blueprint, url_prefix in blueprints:
        print(f" - {blueprint.name} at {url_prefix}")
