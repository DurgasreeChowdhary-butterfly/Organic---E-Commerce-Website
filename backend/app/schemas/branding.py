"""Pydantic schemas for site branding (logo)."""
from typing import Optional

from pydantic import BaseModel


class BrandingRead(BaseModel):
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True
