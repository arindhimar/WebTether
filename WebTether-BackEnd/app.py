from flask import Flask
from flask_cors import CORS
import logging
from models.db import db
from routes.user_routes import user_routes
from routes.website_routes import website_routes
from routes.validator_routes import validator_routes
from routes.report_routes import report_routes
from routes.auth_routes import auth_routes

def create_app():
    app = Flask(__name__)

    # Set up logging
    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)

    # Configure the database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/webtether'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize the database with the app
    db.init_app(app)

    # Register routes
    app.register_blueprint(user_routes, url_prefix='/api/users')
    app.register_blueprint(website_routes, url_prefix='/api/websites')
    app.register_blueprint(validator_routes, url_prefix='/api/validators')
    app.register_blueprint(report_routes, url_prefix='/api/reports')
    app.register_blueprint(auth_routes, url_prefix='/api/auth')

    # Create tables (only once, or use migrations)
    with app.app_context():
        app.logger.info("Creating database tables...")
        db.create_all()
        app.logger.info("Database tables created successfully")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

