from flask import Flask, jsonify
from flask_cors import CORS
from models.db import db
import os
import logging
from routes import register_routes
from models import create_tables
import inspect
from sqlalchemy import MetaData, text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Configure CORS properly with specific settings
    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization", "X-Clerk-User-Id", "X-User-Id"]}})

    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:password@localhost/webtether')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Register routes
    register_routes(app)
    
    # Create database tables
    try:
        create_tables(app)
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        # Continue with app startup even if table creation fails
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy"})
    
    # Add a route to handle OPTIONS requests globally
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        return '', 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
