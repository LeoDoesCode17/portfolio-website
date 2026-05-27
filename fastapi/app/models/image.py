# fastapi/app/models/image.py

from app.core.database import Base
from sqlalchemy import Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_section import PostSection

class Image(Base): 
    __tablename__ = 'images'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_section_id: Mapped[int] = mapped_column(Integer, ForeignKey('post_sections.id'), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # One Image -> one post section
    post_section: Mapped["PostSection"] = relationship(
        "PostSection",
        back_populates="images",
    )