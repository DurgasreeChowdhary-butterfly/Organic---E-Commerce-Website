"""
Maintainable FAQ knowledge source for the AI Assistant.

Each entry pairs a canonical answer (grounded in this store's actual
functionality) with a set of keyword phrases used for direct matching.
A direct match returns the canned answer with zero LLM calls, so these
answers can never drift or hallucinate.
"""
from dataclasses import dataclass, field


@dataclass(frozen=True)
class FaqEntry:
    slug: str
    question: str
    answer: str
    keywords: tuple[str, ...] = field(default_factory=tuple)
    escalate: bool = False


FAQ_ITEMS: tuple[FaqEntry, ...] = (
    FaqEntry(
        slug="place_order",
        question="How do I place an order?",
        answer=(
            "Add items to your cart, go to checkout, choose or add a delivery address, "
            "then pay securely via Razorpay (cards, UPI, net banking, or wallets). "
            "You'll get an order confirmation right after payment succeeds."
        ),
        keywords=("place an order", "place order", "how to order", "how do i order", "how to buy", "how do i buy"),
    ),
    FaqEntry(
        slug="payment_methods",
        question="What payment methods are supported?",
        answer=(
            "Payments are processed securely through Razorpay, which supports credit/debit cards, "
            "UPI, net banking, and popular wallets."
        ),
        keywords=("payment method", "payment option", "how to pay", "upi", "net banking", "netbanking", "credit card", "debit card", "wallet payment"),
    ),
    FaqEntry(
        slug="track_order",
        question="How do I track my order?",
        answer=(
            "Go to My Account → My Orders and open the order to see its live status "
            "(Pending, Confirmed, Packed, Shipped, Delivered) along with a timeline."
        ),
        keywords=("track my order", "track order", "tracking", "order status", "where is my order"),
    ),
    FaqEntry(
        slug="cancel_order",
        question="How do I cancel an order?",
        answer=(
            "Open the order from My Orders → Order Details and tap Cancel Order. Cancellation is "
            "available while the order is Pending, Confirmed, or Packed. Reserved stock is released "
            "automatically, and any payment already made is refunded per our refund policy."
        ),
        keywords=("cancel order", "cancel my order", "how to cancel", "cancel an order"),
    ),
    FaqEntry(
        slug="coupons",
        question="How do coupons work?",
        answer=(
            "Enter a valid coupon code at cart or checkout before paying to get a percentage or flat "
            "discount, subject to a minimum order value and validity dates. Invalid or expired codes "
            "are rejected with a clear message."
        ),
        keywords=("coupon", "promo code", "discount code", "voucher"),
    ),
    FaqEntry(
        slug="contact_support",
        question="How do I contact support?",
        answer=(
            "You can keep chatting with me for quick questions, use the Contact page form, or tap the "
            "WhatsApp button to talk directly with our support team."
        ),
        keywords=("contact support", "customer support", "contact you", "reach you", "helpline", "customer care"),
        escalate=True,
    ),
    FaqEntry(
        slug="gst_invoice",
        question="Do you provide GST invoices?",
        answer=(
            "Yes — every order includes GST calculated per product, and a GST-compliant invoice is "
            "available anytime from Order Details → Download Invoice."
        ),
        keywords=("gst", "invoice", "tax invoice", "bill"),
    ),
    FaqEntry(
        slug="manage_address",
        question="How do I manage my address?",
        answer=(
            "Add, edit, remove, or set a default delivery address from My Account → Addresses, or add "
            "a new one directly during checkout."
        ),
        keywords=("manage address", "delivery address", "shipping address", "my address", "add address"),
    ),
    FaqEntry(
        slug="out_of_stock",
        question="What happens if a product is out of stock?",
        answer=(
            "Out-of-stock products are clearly marked and can't be added to the cart. Try browsing "
            "similar in-stock alternatives in the same category, or check back later — we restock regularly."
        ),
        keywords=("out of stock", "sold out", "unavailable", "back in stock", "restock"),
    ),
)


def find_faq_match(lower_message: str) -> FaqEntry | None:
    """Return the first FAQ whose keyword phrase appears in the (already-lowercased) message."""
    for entry in FAQ_ITEMS:
        if any(keyword in lower_message for keyword in entry.keywords):
            return entry
    return None


def faq_context_block() -> str:
    """Render all FAQs as plain text so Gemini can ground open-ended answers on real functionality."""
    lines = [f"Q: {entry.question}\nA: {entry.answer}" for entry in FAQ_ITEMS]
    return "\n\n".join(lines)
