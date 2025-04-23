from .db import db
from .user_model import User
from .website_model import Website
from .validator_model import Validator
from .report_model import Report

def create_tables(app):
    """
    Create all database tables for the application.
    
    Args:
        app: Flask application instance with configured database
    """
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Log success
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Database tables created successfully")
