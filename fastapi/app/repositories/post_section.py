# app/repositories/post_section.py\

# app/repositories/post_section.py

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.post_section import PostSection


def get_by_id(db: Session, id: int) -> PostSection:
    try:
        section = (
            db.query(PostSection)
            .filter(PostSection.id == id, PostSection.is_deleted == False)
            .first()
        )
    except SQLAlchemyError as err_orm:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve post section with id {id}: {err_orm}",
        )

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post section with id {id} not found",
        )

    return section


def get_by_post_id(
    db: Session,
    post_id: int,
    include_deleted: bool = False,
) -> list[PostSection]:
    try:
        query = db.query(PostSection).filter(PostSection.post_id == post_id)
        if not include_deleted:
            query = query.filter(PostSection.is_deleted == False)
        sections = query.order_by(PostSection.order_index).all()
        return sections
    except SQLAlchemyError as err_orm:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sections for post_id {post_id}: {err_orm}",
        )


def create(db: Session, data: dict) -> PostSection:
    """
    data is a dict that should contain:
      post_id, key, title, order_index, content_md, is_deleted (optional)
    """
    try:
        section = PostSection(**data)
        db.add(section)
        db.commit()
        db.refresh(section)
        return section
    except IntegrityError as err_integrity:
        db.rollback()
        # adjust message if you later add a unique constraint on (post_id, key) etc.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Post section integrity error: {err_integrity}",
        )
    except SQLAlchemyError as err_orm:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create post section: {err_orm}",
        )


def update(db: Session, id: int, data: dict) -> PostSection:
    """
    Partial update: only keys present in `data` are updated.
    """
    section = (
        db.query(PostSection)
        .filter(PostSection.id == id, PostSection.is_deleted == False)
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post section with id {id} not found",
        )

    try:
        for key, value in data.items():
            setattr(section, key, value)
        db.commit()
        db.refresh(section)
        return section
    except IntegrityError as err_integrity:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Post section integrity error: {err_integrity}",
        )
    except SQLAlchemyError as err_orm:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update post section with id {id}: {err_orm}",
        )


def delete(db: Session, id: int) -> PostSection:
    """
    Soft delete: sets is_deleted = True.
    """
    section = (
        db.query(PostSection)
        .filter(PostSection.id == id, PostSection.is_deleted == False)
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post section with id {id} not found",
        )

    try:
        section.is_deleted = True
        db.commit()
        db.refresh(section)
        return section
    except SQLAlchemyError as err_orm:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete post section with id {id}: {err_orm}",
        )