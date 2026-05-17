# fastapi/app/routers/image.py
from fastapi import APIRouter
from app.schemas.image import ImageResponse, ImageCreate

router = APIRouter(
    prefix='/images',
    tags=['Images']
)

@router.get('/', response_model=list[ImageResponse])
async def read_all_images():
    return [
        {
            'id': 1,
            'name': 'Leonardo Image',
            'url': 'Leonardo-ulr.url',
            'alt_text': 'This is the alt text'
        }
    ]

@router.post('/', response_model=ImageResponse)
async def create_an_image(image: ImageCreate):
    return {
        'id': 1,
        'name': image.name,
        'url': image.url,
        'alt_text': image.alt_text
    }


