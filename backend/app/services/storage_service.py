"""
File/image upload storage.

Stores files on local disk under `static/uploads/` and returns a URL path
served by FastAPI's StaticFiles mount (see app/main.py). This is a
pragmatic default for environments without cloud object storage
configured — swap for S3/R2 by replacing the two functions below.
"""
import os
import uuid
from pathlib import Path

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / "static"
UPLOAD_DIR = STATIC_ROOT / "uploads" / "products"


class UnsupportedFileType(ValueError):
    pass


class FileTooLarge(ValueError):
    pass


def upload_product_image(file_bytes: bytes, content_type: str) -> str:
    """Save an image to local disk and return its public URL path."""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise UnsupportedFileType(f"Unsupported file type: {content_type}")
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise FileTooLarge("Image exceeds the 5MB size limit")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = ALLOWED_CONTENT_TYPES[content_type]
    filename = f"{uuid.uuid4()}.{ext}"
    path = UPLOAD_DIR / filename
    path.write_bytes(file_bytes)
    return f"/static/uploads/products/{filename}"


def delete_product_image(image_url: str) -> None:
    """Best-effort delete of a previously uploaded image, given its URL path."""
    if not image_url.startswith("/static/uploads/products/"):
        return
    filename = image_url.rsplit("/", 1)[-1]
    path = UPLOAD_DIR / filename
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
