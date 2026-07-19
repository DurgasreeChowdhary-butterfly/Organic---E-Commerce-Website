"""
File/image upload storage.

Stores files on local disk under `static/uploads/` and returns a URL path
served by FastAPI's StaticFiles mount (see app/main.py). This is a
pragmatic default for environments without cloud object storage
configured — swap for S3/R2 by replacing the two functions below.
"""
import io
import os
import uuid
from pathlib import Path

from PIL import Image

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
}
# Pillow's reported format for each accepted content type, used to confirm the
# uploaded bytes are actually a decodable image of the claimed kind rather than
# arbitrary bytes wearing a spoofed Content-Type header.
EXPECTED_PIL_FORMAT = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/gif": "GIF",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

STATIC_ROOT = Path(__file__).resolve().parent.parent.parent / "static"
UPLOAD_DIR = STATIC_ROOT / "uploads" / "products"
BRANDING_UPLOAD_DIR = STATIC_ROOT / "uploads" / "branding"


class UnsupportedFileType(ValueError):
    pass


class FileTooLarge(ValueError):
    pass


class InvalidImageContent(ValueError):
    pass


def _validate_image(file_bytes: bytes, content_type: str) -> None:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise UnsupportedFileType(f"Unsupported file type: {content_type}")
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise FileTooLarge("Image exceeds the 5MB size limit")

    # Verify the bytes actually decode as the claimed image format — the
    # Content-Type header alone is client-supplied and can't be trusted.
    # Pillow's .verify() can raise a range of exception types for corrupt
    # input depending on the format (SyntaxError, struct.error, ValueError,
    # ...), not just UnidentifiedImageError/OSError — catch broadly here so
    # a malformed upload maps to a clean 400 instead of crashing the request.
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
        detected_format = image.format
    except Exception as exc:
        raise InvalidImageContent("The uploaded file is not a valid image") from exc
    if detected_format != EXPECTED_PIL_FORMAT[content_type]:
        raise InvalidImageContent("File content does not match its declared image type")


def _save_upload(file_bytes: bytes, content_type: str, directory: Path) -> str:
    directory.mkdir(parents=True, exist_ok=True)
    ext = ALLOWED_CONTENT_TYPES[content_type]
    filename = f"{uuid.uuid4()}.{ext}"
    (directory / filename).write_bytes(file_bytes)
    return filename


def _delete_upload(url_path: str, url_prefix: str, directory: Path) -> None:
    if not url_path.startswith(url_prefix):
        return
    filename = url_path.rsplit("/", 1)[-1]
    try:
        os.remove(directory / filename)
    except FileNotFoundError:
        pass


def upload_product_image(file_bytes: bytes, content_type: str) -> str:
    """Save a product image to local disk and return its public URL path."""
    _validate_image(file_bytes, content_type)
    filename = _save_upload(file_bytes, content_type, UPLOAD_DIR)
    return f"/static/uploads/products/{filename}"


def delete_product_image(image_url: str) -> None:
    """Best-effort delete of a previously uploaded product image, given its URL path."""
    _delete_upload(image_url, "/static/uploads/products/", UPLOAD_DIR)


def upload_branding_logo(file_bytes: bytes, content_type: str) -> str:
    """Save the storefront logo to local disk and return its public URL path."""
    _validate_image(file_bytes, content_type)
    filename = _save_upload(file_bytes, content_type, BRANDING_UPLOAD_DIR)
    return f"/static/uploads/branding/{filename}"


def delete_branding_logo(logo_url: str) -> None:
    """Best-effort delete of a previously uploaded logo, given its URL path."""
    _delete_upload(logo_url, "/static/uploads/branding/", BRANDING_UPLOAD_DIR)
