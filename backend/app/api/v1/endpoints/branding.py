"""Site branding (logo) — public, read-only for the customer-facing header."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import branding as branding_crud
from app.db.session import get_db
from app.schemas.branding import BrandingRead

router = APIRouter()


@router.get("/", response_model=BrandingRead)
def get_branding(db: Session = Depends(get_db)):
    """Current site branding (logo) — falls back to no logo (customer
    header renders its default mark) if none has been uploaded yet."""
    return branding_crud.get(db)
