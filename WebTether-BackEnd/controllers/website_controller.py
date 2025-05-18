from flask import jsonify, request, current_app
from models.db import db
from models.website_model import Website
from datetime import datetime
import random

class WebsiteController:
    @staticmethod
    def get_all_websites():
        try:
            # Get the user from the request context (set by auth middleware)
            user = request.user
            
            # Get all websites for this user
            websites = Website.query.filter_by(user_id=user.id).all()
            
            # Log for debugging
            current_app.logger.info(f"Found {len(websites)} websites for user {user.id}")
            
            return jsonify([website.to_dict() for website in websites])
        except Exception as e:
            current_app.logger.error(f"Error getting websites: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_website():
        try:
            data = request.get_json()
            user = request.user
            
            # Generate some random data for demo purposes
            status_options = ['up', 'down', 'degraded']
            status_weights = [0.8, 0.1, 0.1]  # 80% chance of 'up'
            
            new_website = Website(
                url=data.get('url'),
                description=data.get('description'),
                status=random.choices(status_options, status_weights)[0],
                uptime=random.uniform(95.0, 100.0) if random.random() > 0.1 else random.uniform(0.0, 95.0),
                latency=random.randint(10, 500),
                last_checked=datetime.utcnow(),
                monitoring_frequency=data.get('monitoring_frequency', '5 minutes'),
                alerts_enabled=data.get('alerts_enabled', True),
                user_id=user.id
            )
            
            db.session.add(new_website)
            db.session.commit()
            
            return jsonify({"message": "Website created", "website": new_website.to_dict()}), 201
        except Exception as e:
            current_app.logger.error(f"Error creating website: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_website(website_id):
        try:
            user = request.user
            website = Website.query.filter_by(id=website_id, user_id=user.id).first_or_404()
            return jsonify(website.to_dict())
        except Exception as e:
            current_app.logger.error(f"Error getting website: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_website(website_id):
        try:
            user = request.user
            website = Website.query.filter_by(id=website_id, user_id=user.id).first_or_404()
            data = request.get_json()
            
            # Update website fields
            for field in ['url', 'description', 'monitoring_frequency', 'alerts_enabled']:
                if field in data:
                    setattr(website, field, data[field])
                    
            db.session.commit()
            return jsonify({"message": "Website updated", "website": website.to_dict()})
        except Exception as e:
            current_app.logger.error(f"Error updating website: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_website(website_id):
        try:
            user = request.user
            website = Website.query.filter_by(id=website_id, user_id=user.id).first_or_404()
            
            db.session.delete(website)
            db.session.commit()
            
            return jsonify({"message": "Website deleted", "website_id": website_id})
        except Exception as e:
            current_app.logger.error(f"Error deleting website: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_website_stats():
        try:
            user = request.user
            websites = Website.query.filter_by(user_id=user.id).all()
            
            # Calculate stats
            total_websites = len(websites)
            
            # In a real app, you would get this from your validator model
            active_validators = random.randint(20, 30)  # Placeholder
            
            # Calculate overall uptime
            if total_websites > 0:
                # Filter out websites with None uptime
                websites_with_uptime = [w for w in websites if w.uptime is not None]
                if websites_with_uptime:
                    overall_uptime = sum(website.uptime for website in websites_with_uptime) / len(websites_with_uptime)
                else:
                    overall_uptime = 0
            else:
                overall_uptime = 0
            
            # Calculate average latency for online websites
            online_websites = [w for w in websites if w.status == 'up' and w.latency is not None]
            if online_websites:
                average_latency = sum(website.latency for website in online_websites) / len(online_websites)
            else:
                average_latency = 0
            
            return jsonify({
                "totalWebsites": total_websites,
                "activeValidators": active_validators,
                "overallUptime": f"{overall_uptime:.2f}%",
                "averageLatency": f"{average_latency:.0f}ms"
            })
        except Exception as e:
            current_app.logger.error(f"Error getting website stats: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def share_website(website_id):
        try:
            # Get Clerk user_id from request headers
            clerk_user_id = request.headers.get('X-Clerk-User-Id')
            
            if not clerk_user_id:
                return jsonify({"error": "User ID is required"}), 400
            
            # Get internal user ID
            # user_id = get_internal_user_id(clerk_user_id) # Assuming this function exists elsewhere
            user = request.user
            user_id = user.id
            if not user_id:
                return jsonify({"error": "User not found"}), 404
            
            # Get data from request
            data = request.get_json()
            
            if not data.get('email'):
                return jsonify({"error": "Email of user to share with is required"}), 400
            
            # Get website by ID
            website = Website.query.filter_by(id=website_id, user_id=user_id).first()
            
            if not website:
                return jsonify({"error": "Website not found or you don't have permission"}), 404
            
            # Find user to share with
            # share_with_user = User.query.filter_by(email=data.get('email')).first() # Assuming User model exists
            # if not share_with_user:
            #     return jsonify({"error": "User to share with not found"}), 404
            
            # Create a website share record
            # website_share = WebsiteShare( # Assuming WebsiteShare model exists
            #     id=str(uuid.uuid4()),
            #     website_id=website_id,
            #     owner_id=user_id,
            #     shared_with_id=share_with_user.id,
            #     permission_level=data.get('permission_level', 'read')
            # )
            
            # db.session.add(website_share)
            # db.session.commit()
            
            return jsonify({"message": "Website sharing is not fully implemented yet"}), 200
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error sharing website: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def toggle_public_status(website_id):
        try:
            # Get Clerk user_id from request headers
            clerk_user_id = request.headers.get('X-Clerk-User-Id')
            
            if not clerk_user_id:
                return jsonify({"error": "User ID is required"}), 400
            
            # Get internal user ID
            # user_id = get_internal_user_id(clerk_user_id)
            user = request.user
            user_id = user.id
            if not user_id:
                return jsonify({"error": "User not found"}), 404
            
            # Get website by ID
            website = Website.query.filter_by(id=website_id, user_id=user_id).first_or_404()
            
            # Toggle public status
            website.is_public = not website.is_public
            
            # Save changes
            db.session.commit()
            
            return jsonify({
                "message": f"Website is now {'public' if website.is_public else 'private'}",
                "is_public": website.is_public
            }), 200
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error toggling website public status: {str(e)}")
            return jsonify({"error": str(e)}), 500
