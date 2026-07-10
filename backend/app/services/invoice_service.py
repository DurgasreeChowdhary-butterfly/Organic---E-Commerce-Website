"""
GST invoice generation service (PDF).
TODO: implement using a PDF library (e.g. reportlab/weasyprint) with GST breakdown.
"""


def generate_invoice_pdf(order_id: str) -> str:
    """Generate a GST-compliant invoice PDF and return its storage URL."""
    raise NotImplementedError


def calculate_gst(subtotal: float, gst_percentage: float) -> float:
    """Calculate GST amount for a given subtotal and rate."""
    raise NotImplementedError
