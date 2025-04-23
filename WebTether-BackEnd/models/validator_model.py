from datetime import datetime
import uuid
from models.db import db

class Validator(db.Model):
    __tablename__ = 'validators'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    ip = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='offline')
    uptime = db.Column(db.Float, default=0.0)
    last_ping = db.Column(db.TIMESTAMP, nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    total_pings = db.Column(db.Integer, default=0)
    successful_pings = db.Column(db.Integer, default=0)
    rewards = db.Column(db.Float, default=0.0)

    # Define relationship with websites through validator_websites
    websites = db.relationship('Website', secondary='validator_websites', backref=db.backref('validators', lazy='dynamic'))

    def __repr__(self):
        return f'<Validator {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'ip': self.ip,
            'status': self.status,
            'uptime': f"{self.uptime:.2f}%" if self.uptime is not None else "0.00%",
            'websites': len(self.websites),
            'lastPing': self.last_ping.isoformat() if self.last_ping else None,
            'user_id': self.user_id,
            'total_pings': self.total_pings,
            'successful_pings': self.successful_pings,
            'rewards': self.rewards,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Association table for many-to-many relationship between validators and websites
class ValidatorWebsite(db.Model):
    __tablename__ = 'validator_websites'

    validator_id = db.Column(db.String(36), db.ForeignKey('validators.id'), primary_key=True)
    website_id = db.Column(db.String(36), db.ForeignKey('websites.id'), primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
