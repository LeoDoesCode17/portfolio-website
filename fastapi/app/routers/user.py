from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse, UserCreate
from typing import Annotated
from app.auth import get_current_user, authenticate_user
from app.core.database import get_db
from app.schemas.token import Token
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, get_password_hash
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.config import settings
import app.repositories.user as user_repository

router = APIRouter(
    prefix='/users',
    tags=['Users']
)

@router.get('/me', response_model=UserResponse)
async def read_user_me(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    return current_user

@router.post('/', response_model=UserResponse)
async def create_a_user(user: UserCreate, db: Session = Depends(get_db)):
    user.password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict['hashed_password'] = user_dict.pop('password')
    user_dict['disabled'] = False
    user = user_repository.create(db, user_dict)
    return user