"""GST invoice PDF generation.

Invoices are generated on demand (not persisted to disk) so they always
reflect the order's current data and never need cache invalidation. Served
through an authenticated endpoint rather than static file hosting since an
invoice contains the customer's personal/billing details.
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.order import Order


def generate_invoice_pdf(order: Order) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm, leftMargin=18 * mm, rightMargin=18 * mm
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("InvoiceTitle", parent=styles["Title"], textColor=colors.HexColor("#1F3D2B"), fontSize=20)
    heading_style = ParagraphStyle("InvoiceHeading", parent=styles["Heading2"], textColor=colors.HexColor("#1F3D2B"))
    normal = styles["Normal"]

    elements = [
        Paragraph("Prakruti Organics", title_style),
        Paragraph("Tax Invoice", heading_style),
        Spacer(1, 4 * mm),
        Paragraph(f"<b>Order:</b> {order.order_number}", normal),
        Paragraph(f"<b>Date:</b> {order.created_at.strftime('%d %B %Y')}", normal),
        Paragraph(f"<b>Status:</b> {order.status.value.replace('_', ' ').title()}", normal),
    ]
    if order.razorpay_payment_id:
        elements.append(Paragraph(f"<b>Payment Reference:</b> {order.razorpay_payment_id}", normal))
    if order.coupon:
        elements.append(Paragraph(f"<b>Coupon Applied:</b> {order.coupon.code}", normal))

    addr = order.address
    elements += [
        Spacer(1, 4 * mm),
        Paragraph("<b>Billed To</b>", heading_style),
        Paragraph(
            f"{addr.full_name}<br/>{addr.house_no}, {addr.street}"
            + (f", {addr.landmark}" if addr.landmark else "")
            + f"<br/>{addr.city}, {addr.state} - {addr.pincode}<br/>Phone: {addr.mobile_number}",
            normal,
        ),
        Spacer(1, 6 * mm),
    ]

    table_data = [["Item", "SKU", "Qty", "Unit Price", "GST %", "GST Amt", "Line Total"]]
    for item in order.items:
        table_data.append(
            [
                item.product_name,
                item.sku,
                str(item.quantity),
                f"Rs. {float(item.unit_price):.2f}",
                f"{float(item.gst_percentage):.1f}%",
                f"Rs. {float(item.line_gst):.2f}",
                f"Rs. {float(item.line_total):.2f}",
            ]
        )

    items_table = Table(table_data, repeatRows=1, colWidths=[45 * mm, 22 * mm, 12 * mm, 24 * mm, 16 * mm, 22 * mm, 24 * mm])
    items_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F3D2B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E8DFC8")),
                ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAF7EF")]),
            ]
        )
    )
    elements.append(items_table)
    elements.append(Spacer(1, 6 * mm))

    totals_data = [
        ["Subtotal", f"Rs. {float(order.subtotal):.2f}"],
        ["Discount", f"- Rs. {float(order.discount_amount):.2f}"],
        ["GST", f"Rs. {float(order.gst_amount):.2f}"],
        ["Shipping", "Free" if float(order.shipping_fee) == 0 else f"Rs. {float(order.shipping_fee):.2f}"],
        ["Total", f"Rs. {float(order.total_amount):.2f}"],
    ]
    totals_table = Table(totals_data, colWidths=[40 * mm, 32 * mm], hAlign="RIGHT")
    totals_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.HexColor("#1F3D2B")),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ]
        )
    )
    elements.append(totals_table)
    elements.append(Spacer(1, 10 * mm))
    elements.append(Paragraph("Thank you for shopping with Prakruti Organics.", normal))

    doc.build(elements)
    return buffer.getvalue()
