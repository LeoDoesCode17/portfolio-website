# fastapi/app/models/post_section_image.py

# between post_section and image

from app.core.database import Base
from sqlalchemy import Integer, Text, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_section import PostSection
    from app.models.image import Image

class PostSectionImage(Base):
    __tablename__ = 'post_section_images'
    __table_args__ = (
        UniqueConstraint(
            "post_section_id",
            "image_id",
            name="uq_post_section_image_post_section_id_image_id"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_section_id: Mapped[int] = mapped_column(Integer, ForeignKey('post_sections.id'), nullable=False)
    image_id: Mapped[int] = mapped_column(Integer, ForeignKey('images.id'), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    key: Mapped[str] = mapped_column(Text, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)    

    # Relationship
    image: Mapped["Image"] = relationship(
        "Image",
        back_populates="post_section_images"
    )
    post_section: Mapped["PostSection"] = relationship(
        "PostSection",
        back_populates="post_section_images"
    )
