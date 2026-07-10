"""
CRUD operations for Wishlist.
TODO: implement create/read/update/delete functions using SQLAlchemy Session.
"""
from sqlalchemy.orm import Session


def get(db: Session, id):
    raise NotImplementedError


def get_multi(db: Session, skip: int = 0, limit: int = 100):
    raise NotImplementedError


def create(db: Session, obj_in):
    raise NotImplementedError


def update(db: Session, db_obj, obj_in):
    raise NotImplementedError


def remove(db: Session, id):
    raise NotImplementedError
