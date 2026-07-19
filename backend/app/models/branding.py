"""Site branding — a singleton row holding the storefront logo. Read by
the public /branding endpoint (customer header) and written by admin-only
upload/delete endpoints."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SiteBranding(Base):
    __tablename__ = "site_branding"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    logo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
