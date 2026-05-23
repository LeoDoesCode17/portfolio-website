# fastapi/app/models/image.py

from app.core.database import Base
from sqlalchemy import Integer, String, Boolean, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_section_image import PostSectionImage

class Image(Base): 
    __tablename__ = 'images'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationship
    post_section_images: Mapped[list["PostSectionImage"]] = relationship(
        "PostSectionImage",
        back_populates="image",
        primaryjoin="and_(Image.id == PostSectionImage.image_id, PostSectionImage.is_deleted == False)"
    )