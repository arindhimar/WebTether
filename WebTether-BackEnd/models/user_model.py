from datetime import datetime
import uuid
from models.db import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = db.Column(db.String(255), unique=True, nullable=True)
    username = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=True)
    auth_provider = db.Column(db.String(50), nullable=True)
    first_name = db.Column(db.String(255), nullable=True)
    last_name = db.Column(db.String(255), nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationship with websites
    websites = db.relationship('Website', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'clerk_id': self.clerk_id,
            'username': self.username,
            'email': self.email,
            'auth_provider': self.auth_provider,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

