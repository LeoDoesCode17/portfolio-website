# app/schemas/post_section.py

from pydantic import BaseModel, Field
from typing import Optional


class PostSectionBase(BaseModel):
    key: str = Field(..., description="Logical key for the section, e.g. 'intro'")
    title: str
    order_index: int
    content_md: str
    is_deleted: bool = False


class PostSectionCreate(PostSectionBase):
    post_id: int


class PostSectionUpdate(BaseModel):
    # All fields optional for partial update
    key: Optional[str] = None
    title: Optional[str] = None
    order_index: Optional[int] = None
    content_md: Optional[str] = None
    is_deleted: Optional[bool] = None


class PostSectionResponse(PostSectionBase):
    id: int
    post_id: int

    class Config:
        from_attributes = True  # SQLAlchemy model -> schema