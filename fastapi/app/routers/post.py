# fastapi/app/routers/post.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserResponse
from typing import Annotated
from app.auth import get_current_user

from app.repositories import post as repository
from app.schemas.post import PostCreate, PostUpdate, PostDelete, PostResponse

router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
)

DbDependency = Annotated[Session, Depends(get_db)]
CurrentUserDependency = Annotated[UserResponse, Depends(get_current_user)]

@router.get('/', response_model=list[PostResponse])
def get_all_posts(db: DbDependency):
    return repository.get(db)

@router.get("/{id}", response_model=PostResponse)
def get_post_by_id(db: DbDependency, id: int):
    return repository.get_by_id(db, id)

@router.get("/slug/{slug}", response_model=PostResponse)
def get_post_by_slug(db: DbDependency, slug: str):
    return repository.get_by_slug(db, slug)

@router.post(
    "/", 
    response_model=PostResponse, 
    status_code=status.HTTP_201_CREATED
)
def create_new_post(
    db: DbDependency, 
    current_user: CurrentUserDependency, 
    post: PostCreate
):
    return repository.create(db, post.model_dump(exclude_unset=True))

@router.patch("/{id}", response_model=PostResponse)
def update_post(
    db: DbDependency,
    current_user: CurrentUserDependency,
    id: int,
    post: PostUpdate
):
    data = post.model_dump(exclude_unset=True)
    if not data:
        return repository.get_by_id(db, id)
    return repository.update(db, id, data)

@router.delete(
    "/{id}",
    response_model=PostDelete,
)
def delete_post(
    db: DbDependency,
    current_user: CurrentUserDependency,
    id: int,
):
    return repository.delete(db, id)

