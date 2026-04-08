from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Image(db.Model):
    __tablename__ = 'images'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    filename = db.Column(db.String(255), unique=True, nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    hash = db.Column(db.String(64), unique=True, nullable=False)
    mime_type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    path = db.Column(db.String(500), nullable=False)
    used_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Postcard(db.Model):
    __tablename__ = 'postcards'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    front_image_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=True)
    back_image_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=True)
    send_date = db.Column(db.Date, nullable=False)
    receive_date = db.Column(db.Date, nullable=True)
    travel_days = db.Column(db.Integer, nullable=True)
    postcard_code = db.Column(db.String(100), nullable=True)
    platform_type = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    front_image = db.relationship('Image', foreign_keys=[front_image_id], backref='postcards_as_front')
    back_image = db.relationship('Image', foreign_keys=[back_image_id], backref='postcards_as_back')


class PlatformRule(db.Model):
    __tablename__ = 'platform_rules'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    pattern = db.Column(db.String(255), nullable=False)
    platform_type = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    description = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)