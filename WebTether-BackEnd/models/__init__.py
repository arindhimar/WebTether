from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user_model import User
from .website_model import Website

