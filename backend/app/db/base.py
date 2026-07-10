"""
SQLAlchemy declarative base. All models import Base from here.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
