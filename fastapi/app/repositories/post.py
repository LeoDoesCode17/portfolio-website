# fastapi/app/repositories/post.py

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.post import Post

def get(db: Session) -> list[Post]:
    try:
        posts = db.query(Post).filter(Post.is_deleted == False).order_by(Post.created_at.desc()).all()
        return posts
    except SQLAlchemyError as err_orm:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve posts {err_orm}",
        )
    
def get_by_id(db: Session, id: int) -> Post:
    try:
        post = db.query(Post).filter(Post.id == id, Post.is_deleted == False).first()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve post with id {id}",
        )        

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {id} not found",
        )

    return post

def get_by_slug(db: Session, slug: str) -> Post:
    try:
        post = db.query(Post).filter(Post.slug == slug, Post.is_deleted == False).first()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve post with slug '{slug}'",
        )        
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with slug '{slug}' not found",
        )

    return post

def create(db: Session, data: dict) -> Post:
    try:
        post = Post(**data)
        db.add(post)
        db.commit()
        db.refresh(post)
        return post
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Post with the same slug already exists",
        )        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create post with error {e}",
        )

def update(db: Session, id: int, data: dict) -> Post:
    post = db.query(Post).filter(Post.id == id, Post.is_deleted == False).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {id} not found",
        )
    
    try:
        pass
    except IntegrityError as err_integrity:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Post with the same slug already exists with error {err_integrity}",
        )
    except SQLAlchemyError as err_orm:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update post with id {id} with error {err_orm}",
        )
    
def delete(db: Session, id: int) -> Post:
    post = db.query(Post).filter(Post.id == id, Post.is_deleted == False).first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {id} not found",
        )

    try:
        post.is_deleted = True
        db.commit()
        return post
    except SQLAlchemyError as err_orm:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete post with id {id}",
        )                



