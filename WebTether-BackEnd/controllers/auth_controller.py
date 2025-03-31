from flask import request, jsonify, current_app
from models.db import db
from models.user_model import User

class AuthController:
    @staticmethod
    def handle_webhook():
        """Handle Clerk webhook events"""
        try:
            data = request.get_json()
            
            # Verify webhook signature (in production)
            # This is a simplified version
            
            event_type = data.get('type')
            
            if event_type == 'user.created':
                # Handle user creation
                user_data = data.get('data', {})
                clerk_id = user_data.get('id')
                email = user_data.get('email_addresses', [{}])[0].get('email_address')
                first_name = user_data.get('first_name')
                last_name = user_data.get('last_name')
                
                # Check if user already exists
                existing_user = User.query.filter_by(email=email).first()
                if existing_user:
                    existing_user.clerk_id = clerk_id
                    existing_user.first_name = first_name
                    existing_user.last_name = last_name
                    db.session.commit()
                else:
                    new_user = User(
                        clerk_id=clerk_id,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        auth_provider='clerk'
                    )
                    db.session.add(new_user)
                    db.session.commit()
                    
            return jsonify({"status": "success"}), 200
        except Exception as e:
            current_app.logger.error(f"Error handling webhook: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    
    @staticmethod
    def verify_token():
        """Verify Clerk JWT token and return user info"""
        try:
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "No token provided"}), 401
            
            token = auth_header.split(' ')[1]
            
            # In a real app, you would verify the JWT token with Clerk's API
            # This is a simplified version
            
            # For now, we'll just check if the user exists in our database
            clerk_user_id = request.json.get('clerk_user_id')
            if not clerk_user_id:
                return jsonify({"error": "No user ID provided"}), 400
                
            user = User.query.filter_by(clerk_id=clerk_user_id).first()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            return jsonify({
                "status": "success",
                "user": user.to_dict()
            }), 200
        except Exception as e:
            current_app.logger.error(f"Error verifying token: {str(e)}")
            return jsonify({"error": str(e)}), 401

