# fastapi/api/models/post.py

from app.core.database import Base
from sqlalchemy import Integer, Boolean, Text, DateTime, func
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_tech import PostTech
    from app.models.post_section import PostSection

class Post(Base):
    __tablename__ = 'posts'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    repo_url: Mapped[str] = mapped_column(Text, nullable=False)
    demo_url: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False 
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False 
    )
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    post_techs: Mapped[list["PostTech"]] = relationship(
        "PostTech",
        back_populates="post",
        primaryjoin="and_(Post.id == PostTech.post_id, PostTech.is_deleted == False)"
    )
    post_sections: Mapped[list["PostSection"]] = relationship(
        "PostSection",
        back_populates="post",
        primaryjoin="and_(Post.id == PostSection.post_id, PostSectin.is_deleted == False)"
    )