# fastapi/app/modles/tech.py

from app.core.database import Base
from sqlalchemy import Integer, String, Boolean, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_tech import PostTech

class Tech(Base):
    __tablename__ = 'techs'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationship
    post_techs: Mapped[list["PostTech"]] = relationship(
        "PostTech",
        back_populates="tech",
        primaryjoin="and_(Tech.id == PostTech.tech_id, PostTech.is_deleted == False)"
    )