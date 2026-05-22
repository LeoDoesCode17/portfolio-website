# fastapi/app/repositories/image.py

from sqlalchemy.orm import Session
from app.models.image import Image

def get(db: Session):
    return db.query(Image).filter(Image.is_deleted == False).all()
