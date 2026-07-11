"""
Customer address book endpoints (multiple addresses, default address).
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import address as address_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate

router = APIRouter()


@router.get("/", response_model=list[AddressRead])
def list_addresses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all saved addresses for the current user, default first."""
    return address_crud.list_for_user(db, current_user.id)


@router.post("/", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Add a new address. The first address for a user is always made default."""
    return address_crud.create(db, current_user.id, payload)


@router.put("/{address_id}", response_model=AddressRead)
def update_address(
    address_id: uuid.UUID,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Edit an existing address."""
    try:
        return address_crud.update(db, current_user.id, address_id, payload)
    except address_crud.AddressNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete an address. If it was the default, another address (if any) becomes default."""
    try:
        address_crud.delete(db, current_user.id, address_id)
    except address_crud.AddressNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")


@router.post("/{address_id}/set-default", response_model=AddressRead)
def set_default_address(
    address_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Mark an address as the default, unsetting any previous default."""
    try:
        return address_crud.set_default(db, current_user.id, address_id)
    except address_crud.AddressNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
