"""User and Address models."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AddressType(str, enum.Enum):
    HOME = "home"
    OFFICE = "office"
    OTHER = "other"


class AuthProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    # Nullable: Google sign-in does not supply a phone number.
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=True)
    # Nullable: Google-only accounts (auth_provider=GOOGLE, never set a
    # local password) have no hash to store.
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=True, index=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(Enum(AuthProvider), default=AuthProvider.LOCAL)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    addresses: Mapped[list["Address"]] = relationship(back_populates="user")
    # TODO: relationships to Cart, Wishlist, Orders, Reviews


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    full_name: Mapped[str] = mapped_column(String(255))
    mobile_number: Mapped[str] = mapped_column(String(15))
    house_no: Mapped[str] = mapped_column(String(100))
    street: Mapped[str] = mapped_column(String(255))
    landmark: Mapped[str] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    pincode: Mapped[str] = mapped_column(String(10))
    address_type: Mapped[AddressType] = mapped_column(Enum(AddressType), default=AddressType.HOME)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="addresses")
