from datetime import datetime
import uuid
from models.db import db

class WebsiteShare(db.Model):
    __tablename__ = 'website_shares'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    website_id = db.Column(db.String(36), db.ForeignKey('websites.id'), nullable=False)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    shared_with_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    permission_level = db.Column(db.String(50), default='read')  # read, ping, manage
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    website = db.relationship('Website', foreign_keys=[website_id])
    owner = db.relationship('User', foreign_keys=[owner_id])
    shared_with = db.relationship('User', foreign_keys=[shared_with_id])

    def __repr__(self):
        return f'<WebsiteShare {self.id}>'
