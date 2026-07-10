"""
Customer address book endpoints (multiple addresses, default address).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
def list_addresses(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """List all saved addresses for the current user. TODO: implement."""
    raise NotImplementedError


@router.post("/")
def create_address(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new address. TODO: implement."""
    raise NotImplementedError


@router.put("/{address_id}")
def update_address(address_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Edit an existing address. TODO: implement."""
    raise NotImplementedError


@router.delete("/{address_id}")
def delete_address(address_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an address. TODO: implement."""
    raise NotImplementedError


@router.post("/{address_id}/set-default")
def set_default_address(address_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark an address as the default. TODO: implement."""
    raise NotImplementedError
