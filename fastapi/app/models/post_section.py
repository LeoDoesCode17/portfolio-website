# fastapi/app/models/post_section.py

from app.core.database import Base
from sqlalchemy import Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.image import Image

class PostSection(Base):
    __tablename__ = 'post_sections'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey('posts.id'), nullable=False)
    key: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content_md: Mapped[str] = mapped_column(Text, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)    

    # One PostSection → one Post
    post: Mapped["Post"] = relationship(
        "Post",
        back_populates="sections",
    )

    # One-to-many with Image
    images: Mapped[list["Image"]] = relationship(
        "Image",
        back_populates="post_section",
        primaryjoin="and_(PostSection.id == Image.post_section_id, Image.is_deleted == False)"
    )
