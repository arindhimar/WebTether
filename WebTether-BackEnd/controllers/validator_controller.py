from flask import jsonify, request, current_app
from models.db import db
from models.validator_model import Validator, ValidatorWebsite
from models.website_model import Website
from datetime import datetime, timedelta
import random
import uuid

class ValidatorController:
    @staticmethod
    def get_all_validators():
        try:
            # Get the user from the request context (set by auth middleware)
            user = request.user
            
            # Get all validators for this user
            validators = Validator.query.filter_by(user_id=user.id).all()
            
            # Log for debugging
            current_app.logger.info(f"Found {len(validators)} validators for user {user.id}")
            
            return jsonify([validator.to_dict() for validator in validators])
        except Exception as e:
            current_app.logger.error(f"Error getting validators: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_validator():
        try:
            data = request.get_json()
            user = request.user
            
            # Generate some random data for demo purposes
            status_options = ['online', 'offline']
            status_weights = [0.9, 0.1]  # 90% chance of 'online'
            
            new_validator = Validator(
                name=data.get('name'),
                location=data.get('location'),
                ip=data.get('ip', '192.168.1.' + str(random.randint(1, 255))),
                status=random.choices(status_options, status_weights)[0],
                uptime=random.uniform(95.0, 100.0) if random.random() > 0.1 else random.uniform(0.0, 95.0),
                last_ping=datetime.utcnow() - timedelta(minutes=random.randint(1, 60)),
                user_id=user.id
            )
            
            db.session.add(new_validator)
            db.session.commit()
            
            # If websites are provided, assign them to the validator
            if 'websites' in data and isinstance(data['websites'], list):
                for website_id in data['websites']:
                    website = Website.query.filter_by(id=website_id, user_id=user.id).first()
                    if website:
                        validator_website = ValidatorWebsite(
                            validator_id=new_validator.id,
                            website_id=website.id
                        )
                        db.session.add(validator_website)
                
                db.session.commit()
            
            return jsonify({"message": "Validator created", "validator": new_validator.to_dict()}), 201
        except Exception as e:
            current_app.logger.error(f"Error creating validator: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_validator(validator_id):
        try:
            user = request.user
            validator = Validator.query.filter_by(id=validator_id, user_id=user.id).first_or_404()
            return jsonify(validator.to_dict())
        except Exception as e:
            current_app.logger.error(f"Error getting validator: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_validator(validator_id):
        try:
            user = request.user
            validator = Validator.query.filter_by(id=validator_id, user_id=user.id).first_or_404()
            data = request.get_json()
            
            # Update validator fields
            for field in ['name', 'location', 'ip']:
                if field in data:
                    setattr(validator, field, data[field])
                    
            db.session.commit()
            
            # Update validator websites if provided
            if 'websites' in data and isinstance(data['websites'], list):
                # Remove all existing associations
                ValidatorWebsite.query.filter_by(validator_id=validator.id).delete()
                
                # Add new associations
                for website_id in data['websites']:
                    website = Website.query.filter_by(id=website_id, user_id=user.id).first()
                    if website:
                        validator_website = ValidatorWebsite(
                            validator_id=validator.id,
                            website_id=website.id
                        )
                        db.session.add(validator_website)
                
                db.session.commit()
            
            return jsonify({"message": "Validator updated", "validator": validator.to_dict()})
        except Exception as e:
            current_app.logger.error(f"Error updating validator: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_validator(validator_id):
        try:
            user = request.user
            validator = Validator.query.filter_by(id=validator_id, user_id=user.id).first_or_404()
            
            # Remove all validator-website associations
            ValidatorWebsite.query.filter_by(validator_id=validator.id).delete()
            
            # Delete the validator
            db.session.delete(validator)
            db.session.commit()
            
            return jsonify({"message": "Validator deleted", "validator_id": validator_id})
        except Exception as e:
            current_app.logger.error(f"Error deleting validator: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_validator_stats():
        try:
            user = request.user
            validators = Validator.query.filter_by(user_id=user.id).all()
            
            # Calculate stats
            total_validators = len(validators)
            active_validators = sum(1 for v in validators if v.status == 'online')
            
            # Count unique locations
            locations = set(v.location for v in validators)
            
            # Count total websites monitored by validators
            total_websites = sum(len(v.websites) for v in validators)
            
            return jsonify({
                "totalValidators": total_validators,
                "activeValidators": active_validators,
                "locations": len(locations),
                "monitoredWebsites": total_websites
            })
        except Exception as e:
            current_app.logger.error(f"Error getting validator stats: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def assign_website(validator_id):
        try:
            user = request.user
            validator = Validator.query.filter_by(id=validator_id, user_id=user.id).first_or_404()
            data = request.get_json()
            
            website_id = data.get('website_id')
            if not website_id:
                return jsonify({"error": "website_id is required"}), 400
                
            website = Website.query.filter_by(id=website_id, user_id=user.id).first_or_404()
            
            # Check if association already exists
            existing = ValidatorWebsite.query.filter_by(
                validator_id=validator.id,
                website_id=website.id
            ).first()
            
            if existing:
                return jsonify({"message": "Website already assigned to validator"}), 200
                
            # Create new association
            validator_website = ValidatorWebsite(
                validator_id=validator.id,
                website_id=website.id
            )
            
            db.session.add(validator_website)
            db.session.commit()
            
            return jsonify({"message": "Website assigned to validator successfully"})
        except Exception as e:
            current_app.logger.error(f"Error assigning website to validator: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
            
    @staticmethod
    def remove_website(validator_id, website_id):
        try:
            user = request.user
            validator = Validator.query.filter_by(id=validator_id, user_id=user.id).first_or_404()
            website = Website.query.filter_by(id=website_id, user_id=user.id).first_or_404()
            
            # Find and delete the association
            association = ValidatorWebsite.query.filter_by(
                validator_id=validator.id,
                website_id=website.id
            ).first_or_404()
            
            db.session.delete(association)
            db.session.commit()
            
            return jsonify({"message": "Website removed from validator successfully"})
        except Exception as e:
            current_app.logger.error(f"Error removing website from validator: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

