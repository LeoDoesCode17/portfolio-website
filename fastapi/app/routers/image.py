from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserResponse
from typing import Annotated
from app.auth import get_current_user
from app.schemas.image import ImageResponse, ImageCreate
from app.repositories import image as repository

router = APIRouter(
    prefix='/images',
    tags=['Images']
)

@router.get('/', response_model=list[ImageResponse])
def read_all_images(db: Session = Depends(get_db)):
    return repository.get(db)

@router.post('/', response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
def create_an_image(
    image: ImageCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    return repository.create(db, image.model_dump())