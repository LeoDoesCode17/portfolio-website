# fastapi/app/auth.py
from sqlalchemy.orm import Session  
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
import app.repositories.user as user_repository
from app.core.security import verify_user_password, DUMMY_HASH
from app.core.database import get_db
from app.schemas.user import UserResponse
from app.schemas.token import TokenData
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

def authenticate_user(db: Session, username: str, password: str):
    user = user_repository.get_by_username(db, username)
    if not user:
        verify_user_password(password, DUMMY_HASH)
        return None
    if not verify_user_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(db: Annotated[Session, Depends(get_db)], token: Annotated[str, Depends(oauth2_scheme)]) -> UserResponse:
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate user credential',
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credential_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user = user_repository.get_by_username(db, token_data.username)
    if not user:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inactive user",
        )
    return user