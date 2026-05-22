# fastapi/app/routers/image.py
from fastapi import APIRouter, Depends, status, HTTPException
from app.schemas.image import ImageResponse, ImageCreate
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories import image as repository

router = APIRouter(
    prefix='/images',
    tags=['Images']
)

@router.get('/', response_model=list[ImageResponse])
async def read_all_images(db: Session = Depends(get_db)):
    images = repository.get(db)
    return images

@router.post('/', response_model=ImageResponse)
async def create_an_image(image: ImageCreate):
    return {
        'id': 1,
        'name': image.name,
        'url': image.url,
        'alt_text': image.alt_text
    }


