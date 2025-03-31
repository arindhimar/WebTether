from flask import request, jsonify, current_app
from models.db import db
from models.user_model import User

class UserController:
    @staticmethod
    def create_user():
        try:
            data = request.get_json()
            
            # Check if user already exists by clerk_id or email
            existing_user = None
            if data.get('clerk_id'):
                existing_user = User.query.filter_by(clerk_id=data.get('clerk_id')).first()
            
            if not existing_user and data.get('email'):
                existing_user = User.query.filter_by(email=data.get('email')).first()
            
            # If user exists, update their information
            if existing_user:
                current_app.logger.info(f"Updating existing user: {existing_user.id}")
                for field in ['username', 'email', 'auth_provider', 
                            'first_name', 'last_name', 'image_url', 'clerk_id']:
                    if field in data and data.get(field):
                        setattr(existing_user, field, data.get(field))
                
                db.session.commit()
                return jsonify({"message": "User updated", "user_id": existing_user.id}), 200
            
            # Create new user
            current_app.logger.info("Creating new user")
            new_user = User(
                username=data.get('username'),
                email=data.get('email'),
                password_hash=data.get('password_hash'),  # Hash the password in a real app!
                auth_provider=data.get('auth_provider'),
                clerk_id=data.get('clerk_id'),
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                image_url=data.get('image_url')
            )
            db.session.add(new_user)
            db.session.commit()
            current_app.logger.info(f"New user created with ID: {new_user.id}")
            return jsonify({"message": "User created", "user_id": new_user.id}), 201
        except Exception as e:
            current_app.logger.error(f"Error creating user: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_user(user_id):
        try:
            user = User.query.get_or_404(user_id)
            return jsonify(user.to_dict())
        except Exception as e:
            current_app.logger.error(f"Error getting user: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_user(user_id):
        try:
            user = User.query.get_or_404(user_id)
            data = request.get_json()
            
            # Update user fields
            for field in ['username', 'email', 'password_hash', 'auth_provider', 
                        'first_name', 'last_name', 'image_url', 'clerk_id']:
                if field in data:
                    setattr(user, field, data[field])
                    
            db.session.commit()
            return jsonify({"message": "User updated", "user": user.to_dict()})
        except Exception as e:
            current_app.logger.error(f"Error updating user: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_user(user_id):
        try:
            user = User.query.get_or_404(user_id)
            db.session.delete(user)
            db.session.commit()
            return jsonify({"message": "User deleted", "user_id": user_id})
        except Exception as e:
            current_app.logger.error(f"Error deleting user: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_user_by_clerk_id(clerk_id):
        try:
            user = User.query.filter_by(clerk_id=clerk_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            return jsonify(user.to_dict())
        except Exception as e:
            current_app.logger.error(f"Error getting user by clerk_id: {str(e)}")
            return jsonify({"error": str(e)}), 500

