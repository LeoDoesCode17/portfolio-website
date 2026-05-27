# fastapi/app/modles/tech.py

from app.core.database import Base
from sqlalchemy import Integer, String, Boolean, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from app.models.post_tech import PostTech
from app.models.post import Post

# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
#     from app.models.post_tech import PostTech
#     from app.models.post import Post

class Tech(Base):
    __tablename__ = 'techs'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationship with post via post_tech
    # Raw junction rows (internal)
    post_techs: Mapped[list["PostTech"]] = relationship(
        "PostTech",
        back_populates="tech",
        primaryjoin="and_(Tech.id == PostTech.tech_id, PostTech.is_deleted == False)"
    )
    # Direct many-to-many to Post
    posts: Mapped[list["Post"]] = relationship(
        "Post",
        secondary="post_techs",
        primaryjoin="and_(Tech.id == PostTech.tech_id, PostTech.is_deleted == False)",
        secondaryjoin="and_(Post.id == PostTech.post_id, Post.is_deleted == False)",
        viewonly=True
    )
