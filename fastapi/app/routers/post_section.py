# app/routers/post_section.py

# app/routers/post_section.py

from typing import List, Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.post_section import (
    PostSectionResponse,
    PostSectionCreate,
    PostSectionUpdate,
)
from app.schemas.user import UserResponse
from app.auth import get_current_user
from app.repositories import post_section as repository

router = APIRouter(
    prefix="/post-sections",
    tags=["post_sections"],
)

DbDependency = Annotated[Session, Depends(get_db)]
CurrentUserDependency = Annotated[UserResponse, Depends(get_current_user)]

@router.get(
    "/{section_id}",
    response_model=PostSectionResponse,
)
def get_post_section(
    section_id: int,
    db: DbDependency,
):
    """
    Get a single post section by id.
    Uses post_section_repo.get_by_id and raises HTTPException on errors.
    """
    return repository.get_by_id(db, section_id)


@router.get(
    "/by-post/{post_id}",
    response_model=List[PostSectionResponse],
)
def list_post_sections_by_post(
    post_id: int,
    db: DbDependency,
    include_deleted: bool = False,
):
    """
    List sections for a given post_id.
    """
    return repository.get_by_post_id(
        db=db,
        post_id=post_id,
        include_deleted=include_deleted,
    )


@router.post(
    "",
    response_model=PostSectionResponse,
    status_code=201,
)
def create_post_section(
    payload: PostSectionCreate,
    db: DbDependency,
    current_user: CurrentUserDependency,
):
    """
    Create a new post section.
    """
    # Convert Pydantic model to dict, ready for **data usage in repo
    data = payload.model_dump()
    return repository.create(db, data)


@router.patch(
    "/{section_id}",
    response_model=PostSectionResponse
)
def update_post_section(
    section_id: int,
    payload: PostSectionUpdate,
    db: DbDependency,
    current_user: CurrentUserDependency
):
    """
    Partially update a post section.
    Only provided fields are updated.
    """
    # Exclude unset so we only update fields the client sent
    data = payload.model_dump(exclude_unset=True)
    return repository.update(db, section_id, data)


@router.delete(
    "/{section_id}",
    response_model=PostSectionResponse,
)
def delete_post_section(
    section_id: int,
    db: DbDependency,
    current_user: CurrentUserDependency
):
    """
    Soft delete a post section (is_deleted=True).
    """
    return repository.delete(db, section_id)