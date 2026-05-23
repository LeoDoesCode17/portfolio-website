# fastapi/app/repositories/tech.py

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi import HTTPException, status
from app.models.tech import Tech

def get(db: Session) -> list[Tech]:
    try:
        return db.query(Tech).filter(Tech.is_deleted == False).all()
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve techs"
        )    
    
def get_by_id(db: Session, id: int) -> Tech:
    try:
        tech_instance = (
            db.query(Tech)
            .filter(Tech.id == id, Tech.is_deleted == False)
            .first()
        )
    except SQLAlchemyError:
        # Error while querying the DB (connection lost, etc.)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Tech with id {id}",
        )

    if not tech_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech with id {id} not found",
        )

    return tech_instance    

def create(db: Session, data: dict) -> Tech:
    try:
        tech_instance = Tech(**data)
        db.add(tech_instance)
        db.commit()
        db.refresh(tech_instance)
        return tech_instance
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tech already exists or violates a unique constraint"
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create Tech"
        )    

def update(db: Session, id: int, data: dict) -> Tech:
    tech_instance = db.query(Tech).filter(
        Tech.id == id,
        Tech.is_deleted == False
    ).first()

    if not tech_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech with id {id} not found"
        )

    try:
        for key, val in data.items():
            setattr(tech_instance, key, val)
        db.commit()
        db.refresh(tech_instance)
        return tech_instance
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update Tech with id {id}"
        )
    
def delete(db: Session, id: int) -> Tech:
    tech_instance = db.query(Tech).filter(
        Tech.id == id,
        Tech.is_deleted == False
    ).first()

    if not tech_instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tech with id {id} not found"
        )

    try:
        tech_instance.is_deleted = True
        db.commit()
        db.refresh(tech_instance)
        return tech_instance
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Tech with id {id}"
        )