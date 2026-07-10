"""
File/image upload storage service (product images, invoices).
TODO: integrate cloud object storage (e.g. S3 / Cloudflare R2).
"""


def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Upload a file and return its public URL."""
    raise NotImplementedError


def delete_file(file_url: str) -> None:
    raise NotImplementedError
