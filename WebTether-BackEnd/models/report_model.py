from datetime import datetime
import uuid
from models.db import db

class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    validator_id = db.Column(db.String(36), db.ForeignKey('validators.id'), nullable=True)
    website_id = db.Column(db.String(36), db.ForeignKey('websites.id'), nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, resolved, rejected
    response = db.Column(db.Text, nullable=True)
    resolved_at = db.Column(db.TIMESTAMP, nullable=True)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    validator = db.relationship('Validator', backref=db.backref('reports', lazy='dynamic'))
    website = db.relationship('Website', backref=db.backref('reports', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Report {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'validator_id': self.validator_id,
            'validator': self.validator.name if self.validator else None,
            'website_id': self.website_id,
            'website': self.website.url if self.website else None,
            'user_id': self.user_id,
            'reason': self.reason,
            'status': self.status,
            'response': self.response,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

