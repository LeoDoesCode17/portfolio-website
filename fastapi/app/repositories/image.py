from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi import HTTPException, status
from app.models.image import Image

def get(db: Session) -> list[Image]:
    try:
        return db.query(Image).filter(Image.is_deleted == False).all()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve images"
        )

def create(db: Session, data: dict) -> Image:
    try:
        image_instance = Image(**data)
        db.add(image_instance)
        db.commit()
        db.refresh(image_instance)
        return image_instance
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Image already exists or violates a unique constraint"
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create image"
        )