from flask import jsonify, request, current_app
from models.db import db
from models.validator_model import Validator
from models.website_model import Website
from models.user_model import User
import uuid
from datetime import datetime
import random
import logging
import requests
from sqlalchemy.exc import SQLAlchemyError

# Configure logging
logger = logging.getLogger(__name__)

def get_internal_user_id(clerk_user_id):
    """Get the internal user ID from the Clerk user ID"""
    user = User.query.filter_by(clerk_id=clerk_user_id).first()
    if user:
        return user.id
    return None

def get_all_validators():
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get all validators for the user
        validators = Validator.query.filter_by(user_id=user_id).all()
        logger.info(f"Found {len(validators)} validators for user {user_id}")
        
        # Convert to list of dictionaries
        validators_list = []
        for validator in validators:
            validator_dict = validator.to_dict()
            
            # Get websites assigned to this validator
            websites = []
            for website in validator.websites:
                websites.append({
                    "id": website.id,
                    "url": website.url,
                    "status": website.status
                })
            
            validator_dict["websites"] = websites
            validators_list.append(validator_dict)
        
        return jsonify(validators_list), 200
    
    except Exception as e:
        logger.error(f"Error getting validators: {str(e)}")
        return jsonify({"error": str(e)}), 500

def create_validator():
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get data from request
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('location'):
            return jsonify({"error": "Name and location are required"}), 400
        
        # Create new validator
        validator = Validator(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            location=data.get('location'),
            ip=data.get('ip', request.remote_addr),
            status='active',
            uptime=100.0,
            user_id=user_id,  # Use internal user ID
            total_pings=0,
            successful_pings=0,
            rewards=0
        )
        
        # Add to database
        db.session.add(validator)
        db.session.commit()
        
        # If websites were provided, assign them to the validator
        if 'websites' in data and isinstance(data['websites'], list):
            for website_id in data['websites']:
                # Check if website exists and belongs to the user
                website = Website.query.filter_by(id=website_id, user_id=user_id).first()
                if website:
                    validator.websites.append(website)
            
            db.session.commit()
        
        # Return the created validator
        validator_dict = validator.to_dict()
        validator_dict["websites"] = []
        
        return jsonify({"message": "Validator created successfully", "validator": validator_dict}), 201
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_validator(validator_id):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # Convert to dictionary
        validator_dict = validator.to_dict()
        
        # Get websites assigned to this validator
        websites = []
        for website in validator.websites:
            websites.append({
                "id": website.id,
                "url": website.url,
                "status": website.status
            })
        
        validator_dict["websites"] = websites
        
        return jsonify(validator_dict), 200
    
    except Exception as e:
        logger.error(f"Error getting validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def update_validator(validator_id):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get data from request
        data = request.get_json()
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # Update validator fields
        if 'name' in data:
            validator.name = data['name']
        
        if 'location' in data:
            validator.location = data['location']
        
        if 'ip' in data:
            validator.ip = data['ip']
        
        if 'status' in data:
            validator.status = data['status']
        
        # Update websites if provided
        if 'websites' in data and isinstance(data['websites'], list):
            # Clear existing websites
            validator.websites = []
            
            # Add new websites
            for website_id in data['websites']:
                # Check if website exists and belongs to the user
                website = Website.query.filter_by(id=website_id, user_id=user_id).first()
                if website:
                    validator.websites.append(website)
        
        # Save changes
        db.session.commit()
        
        # Return updated validator
        validator_dict = validator.to_dict()
        
        # Get websites assigned to this validator
        websites = []
        for website in validator.websites:
            websites.append({
                "id": website.id,
                "url": website.url,
                "status": website.status
            })
        
        validator_dict["websites"] = websites
        
        return jsonify({"message": "Validator updated successfully", "validator": validator_dict}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def delete_validator(validator_id):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # Delete validator
        db.session.delete(validator)
        db.session.commit()
        
        return jsonify({"message": "Validator deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_validator_stats():
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get all validators for the user
        validators = Validator.query.filter_by(user_id=user_id).all()
        
        # Get all websites for the user
        websites = Website.query.filter_by(user_id=user_id).all()
        
        # Calculate stats
        total_validators = len(validators)
        active_validators = len([v for v in validators if v.status == 'active'])
        
        # Get unique locations
        locations = set()
        for validator in validators:
            if validator.location:
                locations.add(validator.location)
        
        # Count websites being monitored by validators
        monitored_websites = 0
        for validator in validators:
            monitored_websites += len(validator.websites)
        
        # Calculate total pings and successful pings
        total_pings = sum(validator.total_pings for validator in validators if hasattr(validator, 'total_pings') and validator.total_pings is not None)
        successful_pings = sum(validator.successful_pings for validator in validators if hasattr(validator, 'successful_pings') and validator.successful_pings is not None)
        
        # Calculate total rewards
        total_rewards = sum(validator.rewards for validator in validators if hasattr(validator, 'rewards') and validator.rewards is not None)
        
        # Calculate validator level and progress
        level = 1
        progress = 0
        
        if total_pings > 0:
            # Simple level calculation based on total pings
            level = min(5, max(1, 1 + total_pings // 50))
            
            # Calculate progress to next level (0-100%)
            if level < 5:
                progress = (total_pings % 50) * 2  # 2% per ping
            else:
                progress = 100  # Max level
        
        stats = {
            "totalValidators": total_validators,
            "activeValidators": active_validators,
            "locations": len(locations),
            "monitoredWebsites": monitored_websites,
            "totalPings": total_pings,
            "successfulPings": successful_pings,
            "totalRewards": total_rewards,
            "level": level,
            "progress": progress
        }
        
        return jsonify(stats), 200
    
    except Exception as e:
        logger.error(f"Error getting validator stats: {str(e)}")
        return jsonify({"error": str(e)}), 500

def assign_website_to_validator(validator_id):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get data from request
        data = request.get_json()
        
        if not data.get('website_id'):
            return jsonify({"error": "Website ID is required"}), 400
        
        website_id = data.get('website_id')
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # Check if website exists and belongs to the user
        website = Website.query.filter_by(id=website_id, user_id=user_id).first()
        
        if not website:
            return jsonify({"error": "Website not found or does not belong to the user"}), 404
        
        # Assign website to validator
        if website not in validator.websites:
            validator.websites.append(website)
            db.session.commit()
        
        return jsonify({"message": "Website assigned to validator successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error assigning website to validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def remove_website_from_validator(validator_id, website_id):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # Check if website exists and belongs to the user
        website = Website.query.filter_by(id=website_id, user_id=user_id).first()
        
        if not website:
            return jsonify({"error": "Website not found or does not belong to the user"}), 404
        
        # Remove website from validator
        if website in validator.websites:
            validator.websites.remove(website)
            db.session.commit()
        
        return jsonify({"message": "Website removed from validator successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error removing website from validator: {str(e)}")
        return jsonify({"error": str(e)}), 500

def ping_website(validator_id, website_id=None):
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get validator by ID
        validator = Validator.query.filter_by(id=validator_id, user_id=user_id).first()
        
        if not validator:
            return jsonify({"error": "Validator not found"}), 404
        
        # If website_id is not provided in the URL, get it from the request body
        if not website_id:
            data = request.get_json()
            website_id = data.get('website_id')
            
            if not website_id:
                return jsonify({"error": "Website ID is required"}), 400
        
        # Check if website exists (without user_id filter)
        website = Website.query.filter_by(id=website_id).first()
        
        if not website:
            return jsonify({"error": "Website not found"}), 404
        
        # Check if website is assigned to the validator or is public
        if website not in validator.websites and website.user_id != user_id:
            # Allow pinging if the website is public
            if not hasattr(website, 'is_public') or not website.is_public:
                return jsonify({"error": "You don't have permission to ping this website"}), 403
        
        # Simulate pinging the website
        # In a real implementation, this would make an actual HTTP request to the website
        success = random.random() > 0.2  # 80% chance of success
        
        # Update website status based on ping result
        if success:
            website.status = "up"
            latency = random.randint(50, 200)  # Random latency between 50-200ms
            website.latency = latency
            
            # Update uptime (weighted average)
            if website.uptime is None:
                website.uptime = 100.0
            else:
                website.uptime = min(100.0, website.uptime * 0.9 + 10.0)  # Gradually increase uptime
        else:
            website.status = "down"
            latency = 0
            
            # Update uptime (weighted average)
            if website.uptime is None:
                website.uptime = 0.0
            else:
                website.uptime = max(0.0, website.uptime * 0.9)  # Gradually decrease uptime
        
        # Update last checked timestamp
        website.last_checked = datetime.utcnow()
        
        # Update validator stats
        if not hasattr(validator, 'total_pings') or validator.total_pings is None:
            validator.total_pings = 0
        validator.total_pings += 1
        
        if success:
            if not hasattr(validator, 'successful_pings') or validator.successful_pings is None:
                validator.successful_pings = 0
            validator.successful_pings += 1
        
        # Calculate reward based on website importance and latency
        reward = 0
        if success:
            # Base reward
            reward = 10
            
            # Bonus for low latency
            if latency < 100:
                reward += 5
            
            # Update validator rewards
            if not hasattr(validator, 'rewards') or validator.rewards is None:
                validator.rewards = 0
            validator.rewards += reward
        
        # Update last ping timestamp
        validator.last_ping = datetime.utcnow()
        
        # Save changes
        db.session.commit()
        
        # Return ping result
        result = {
            "success": success,
            "status": website.status,
            "latency": latency,
            "timestamp": website.last_checked.isoformat() if website.last_checked else None,
            "reward": reward
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error pinging website: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_enhanced_validator_stats():
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get basic stats first
        basic_stats_response, status_code = get_validator_stats()
        if status_code != 200:
            return basic_stats_response, status_code
        
        basic_stats = basic_stats_response.get_json()
        
        # Get all validators for the user
        validators = Validator.query.filter_by(user_id=user_id).all()
        
        # Get all websites for the user
        websites = Website.query.filter_by(user_id=user_id).all()
        
        # Calculate additional stats
        
        # Website status breakdown
        status_counts = {
            "up": 0,
            "down": 0,
            "unknown": 0
        }
        
        for website in websites:
            if website.status == "up":
                status_counts["up"] += 1
            elif website.status == "down":
                status_counts["down"] += 1
            else:
                status_counts["unknown"] += 1
        
        # Validator performance ranking
        validator_performance = []
        for validator in validators:
            if hasattr(validator, 'total_pings') and validator.total_pings and validator.total_pings > 0:
                success_rate = (validator.successful_pings or 0) / validator.total_pings * 100
            else:
                success_rate = 0
            
            validator_performance.append({
                "id": validator.id,
                "name": validator.name,
                "successRate": success_rate,
                "totalPings": validator.total_pings if hasattr(validator, 'total_pings') else 0,
                "rewards": validator.rewards if hasattr(validator, 'rewards') else 0
            })
        
        # Sort by success rate descending
        validator_performance.sort(key=lambda x: x["successRate"], reverse=True)
        
        # Add enhanced stats to basic stats
        enhanced_stats = {
            **basic_stats,
            "websiteStatus": status_counts,
            "validatorPerformance": validator_performance
        }
        
        return jsonify(enhanced_stats), 200
    
    except Exception as e:
        logger.error(f"Error getting enhanced validator stats: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_all_websites_for_validator():
    try:
        # Get Clerk user_id from request headers
        clerk_user_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Get internal user ID
        user_id = get_internal_user_id(clerk_user_id)
        if not user_id:
            return jsonify({"error": "User not found"}), 404
        
        # Get all websites owned by the user
        owned_websites = Website.query.filter_by(user_id=user_id).all()
        
        # Get all public websites not owned by the user
        public_websites = Website.query.filter(
            Website.is_public == True,
            Website.user_id != user_id
        ).all()
        
        # Combine and convert to list of dictionaries
        all_websites = []
        
        for website in owned_websites:
            website_dict = website.to_dict()
            website_dict['ownership'] = 'owned'
            
            # Add owner information
            website_dict['owner'] = {
                'id': user_id,
                'username': User.query.get(user_id).username if User.query.get(user_id) else 'Unknown'
            }
            
            all_websites.append(website_dict)
        
        for website in public_websites:
            website_dict = website.to_dict()
            website_dict['ownership'] = 'public'
            
            # Add owner information
            owner = User.query.get(website.user_id)
            website_dict['owner'] = {
                'id': website.user_id,
                'username': owner.username if owner else 'Unknown'
            }
            
            all_websites.append(website_dict)
        
        return jsonify(all_websites), 200
    
    except Exception as e:
        logger.error(f"Error getting websites for validator: {str(e)}")
        return jsonify({"error": str(e)}), 500
