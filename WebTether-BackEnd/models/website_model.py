from datetime import datetime
import uuid
from models.db import db

class Website(db.Model):
    __tablename__ = 'websites'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='unknown')
    uptime = db.Column(db.Float, default=0.0)
    latency = db.Column(db.Integer, default=0)
    last_checked = db.Column(db.TIMESTAMP, nullable=True)
    monitoring_frequency = db.Column(db.String(50), default='5 minutes')
    alerts_enabled = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Website {self.url}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'description': self.description,
            'status': self.status,
            'uptime': f"{self.uptime:.2f}%" if self.uptime is not None else "0.00%",
            'latency': self.latency,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None,
            'monitoring_frequency': self.monitoring_frequency,
            'alerts_enabled': self.alerts_enabled,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
