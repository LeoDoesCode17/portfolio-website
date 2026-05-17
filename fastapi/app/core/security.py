# fastapi/app/core/security.py

import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash(settings.DUMMY_PASSWORD)

def verify_user_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return password_hash.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Encode user data into a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)