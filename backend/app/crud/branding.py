"""CRUD for the singleton SiteBranding row (lazily created on first read)."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.branding import SiteBranding


def get(db: Session) -> SiteBranding:
    branding = db.scalar(select(SiteBranding))
    if branding is None:
        branding = SiteBranding(logo_url=None)
        db.add(branding)
        db.commit()
        db.refresh(branding)
    return branding


def set_logo(db: Session, branding: SiteBranding, logo_url: str) -> SiteBranding:
    branding.logo_url = logo_url
    db.add(branding)
    db.commit()
    db.refresh(branding)
    return branding


def clear_logo(db: Session, branding: SiteBranding) -> SiteBranding:
    branding.logo_url = None
    db.add(branding)
    db.commit()
    db.refresh(branding)
    return branding
