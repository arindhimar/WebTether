from functools import wraps
from flask import request, jsonify, current_app
from models.db import db
from models.user_model import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            
            # During development, we'll be more lenient with authentication
            # In production, you would properly verify the JWT token
            
            # Get the clerk user ID from the header
            clerk_user_id = request.headers.get('X-Clerk-User-Id')
            
            
            # For development, if we have a clerk_user_id, we'll consider the request authenticated
            if clerk_user_id:
                # Try to find the user
                user = User.query.filter_by(clerk_id=clerk_user_id).first()
                
                # If user doesn't exist yet, create a placeholder user
                if not user:
                    current_app.logger.info(f"Creating placeholder user for clerk_id: {clerk_user_id}")
                    user = User(
                        clerk_id=clerk_user_id,
                        email=f"{clerk_user_id}@placeholder.com",  # Placeholder email
                        auth_provider='clerk'
                    )
                    db.session.add(user)
                    db.session.commit()
                
                # Add user to request context
                request.user = user
                
                return f(*args, **kwargs)
            else:
                return jsonify({"error": "Authentication required"}), 401
                
        except Exception as e:
            current_app.logger.error(f"Auth error: {str(e)}")
            return jsonify({"error": str(e)}), 401
            
    return decorated

# Add alias for token_required as auth_required for backward compatibility
auth_required = token_required
