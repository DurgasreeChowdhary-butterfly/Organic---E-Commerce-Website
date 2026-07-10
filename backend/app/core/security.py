"""
Password hashing and JWT access/refresh token utilities.
TODO: implement actual hashing (passlib) and token encode/decode logic.
"""
from datetime import datetime, timedelta
from typing import Any, Optional

from app.core.config import settings

# from passlib.context import CryptContext
# from jose import jwt
#
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password. TODO: use passlib bcrypt."""
    raise NotImplementedError


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash. TODO: implement."""
    raise NotImplementedError


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token. TODO: implement with python-jose."""
    raise NotImplementedError


def create_refresh_token(subject: str) -> str:
    """Create a signed JWT refresh token. TODO: implement."""
    raise NotImplementedError


def decode_token(token: str) -> Any:
    """Decode and validate a JWT, raising on failure. TODO: implement."""
    raise NotImplementedError
