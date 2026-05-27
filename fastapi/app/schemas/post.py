# fastapi/app/schemas/post.py

from datetime import datetime
from pydantic import BaseModel, Field

class PostBase(BaseModel):
    title: str = Field(..., max_length=10_000)
    slug: str
    summary: str
    repo_url: str
    demo_url: str | None = None
    is_published: bool = False

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    """Partial update (PATCH). Only provided fields will be updated."""
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    repo_url: str | None = None
    demo_url: str | None = None
    is_published: bool | None = None

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class config:
        from_attributes = True # allows ORM object

class PostDelete(BaseModel):
    title: str
    slug: str