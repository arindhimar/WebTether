from flask import jsonify, request, current_app
from models.db import db
from models.report_model import Report
from models.validator_model import Validator
from models.website_model import Website
from datetime import datetime
import random
import uuid

class ReportController:
    @staticmethod
    def get_all_reports():
        try:
            # Get the user from the request context (set by auth middleware)
            user = request.user
            
            # Get all reports for this user
            reports = Report.query.filter_by(user_id=user.id).all()
            
            # Log for debugging
            current_app.logger.info(f"Found {len(reports)} reports for user {user.id}")
            
            return jsonify([report.to_dict() for report in reports])
        except Exception as e:
            current_app.logger.error(f"Error getting reports: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_report():
        try:
            data = request.get_json()
            user = request.user
            
            # Validate required fields
            if not data.get('reason'):
                return jsonify({"error": "Reason is required"}), 400
                
            # Check for validator or website
            validator_id = data.get('validator_id')
            website_id = data.get('website_id')
            
            # Validate validator if provided
            if validator_id:
                validator = Validator.query.filter_by(id=validator_id).first()
                if not validator:
                    return jsonify({"error": "Validator not found"}), 404
            
            # Validate website if provided
            if website_id:
                website = Website.query.filter_by(id=website_id).first()
                if not website:
                    return jsonify({"error": "Website not found"}), 404
            
            new_report = Report(
                validator_id=validator_id,
                website_id=website_id,
                user_id=user.id,
                reason=data.get('reason'),
                status='pending'
            )
            
            db.session.add(new_report)
            db.session.commit()
            
            return jsonify({"message": "Report created", "report": new_report.to_dict()}), 201
        except Exception as e:
            current_app.logger.error(f"Error creating report: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_report(report_id):
        try:
            user = request.user
            report = Report.query.filter_by(id=report_id, user_id=user.id).first_or_404()
            return jsonify(report.to_dict())
        except Exception as e:
            current_app.logger.error(f"Error getting report: {str(e)}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_report(report_id):
        try:
            user = request.user
            report = Report.query.filter_by(id=report_id, user_id=user.id).first_or_404()
            data = request.get_json()
            
            # Allow updating only the reason for pending reports
            if report.status == 'pending' and 'reason' in data:
                report.reason = data['reason']
                
            # Allow admins to update status and response (in a real app, check user role)
            if 'status' in data:
                report.status = data['status']
                # If being resolved or rejected, set resolved time
                if data['status'] in ['resolved', 'rejected'] and not report.resolved_at:
                    report.resolved_at = datetime.utcnow()
                    
            if 'response' in data:
                report.response = data['response']
                    
            db.session.commit()
            return jsonify({"message": "Report updated", "report": report.to_dict()})
        except Exception as e:
            current_app.logger.error(f"Error updating report: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_report(report_id):
        try:
            user = request.user
            report = Report.query.filter_by(id=report_id, user_id=user.id).first_or_404()
            
            # Only allow deleting pending reports
            if report.status != 'pending':
                return jsonify({"error": "Only pending reports can be deleted"}), 400
                
            db.session.delete(report)
            db.session.commit()
            
            return jsonify({"message": "Report deleted", "report_id": report_id})
        except Exception as e:
            current_app.logger.error(f"Error deleting report: {str(e)}")
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
            
    @staticmethod
    def get_report_stats():
        try:
            user = request.user
            reports = Report.query.filter_by(user_id=user.id).all()
            
            # Count reports by status
            total_reports = len(reports)
            pending_reports = sum(1 for r in reports if r.status == 'pending')
            resolved_reports = sum(1 for r in reports if r.status == 'resolved')
            rejected_reports = sum(1 for r in reports if r.status == 'rejected')
            
            # Calculate average resolution time for resolved reports
            resolved_list = [r for r in reports if r.status == 'resolved' and r.resolved_at]
            if resolved_list:
                total_resolution_time = sum((r.resolved_at - r.created_at).total_seconds() for r in resolved_list)
                avg_resolution_time = total_resolution_time / len(resolved_list) / 3600  # in hours
            else:
                avg_resolution_time = 0
                
            return jsonify({
                "totalReports": total_reports,
                "pendingReports": pending_reports,
                "resolvedReports": resolved_reports,
                "rejectedReports": rejected_reports,
                "averageResolutionTime": f"{avg_resolution_time:.1f} hours" 
            })
        except Exception as e:
            current_app.logger.error(f"Error getting report stats: {str(e)}")
            return jsonify({"error": str(e)}), 500

