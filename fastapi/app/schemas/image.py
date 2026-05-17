# fastapi/app/schemas/image.py
from pydantic import BaseModel

class ImageResponse(BaseModel):
    id: int
    name: str
    url: str
    alt_text: str

class ImageCreate(BaseModel):
    name: str
    url: str
    alt_text: str

