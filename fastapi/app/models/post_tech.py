# fasapi/app/models/post_tech.py

from app.core.database import Base
from sqlalchemy import Integer, Text, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import mapped_column, Mapped, relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.tech import Tech


class PostTech(Base):
    __tablename__ = 'post_techs'
    __table_args__ = (
        UniqueConstraint(
            "post_id",
            "tech_id",
            name="uq_post_tech_post_id_tech_id"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey('posts.id'), nullable=False)
    tech_id: Mapped[int] = mapped_column(Integer, ForeignKey('techs.id'), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    post: Mapped["Post"] = relationship("Post", back_populates="post_techs")
    tech: Mapped["Tech"] = relationship("Tech", back_populates="post_techs")