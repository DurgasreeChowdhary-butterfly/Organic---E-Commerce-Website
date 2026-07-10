"""Product review model."""
import uuid
from datetime import datetime

from sqlalchemy import Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
