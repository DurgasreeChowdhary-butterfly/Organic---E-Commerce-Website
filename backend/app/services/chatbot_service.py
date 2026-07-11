"""
AI Assistant service: answers FAQs and helps customers discover real products,
grounded in the live database. Gemini is only used for open-ended questions that
don't match a canned FAQ, and even then its reply text is never trusted to name
products - product suggestions returned to the frontend always come straight
from a real database search, never from the model's own text.
"""
import logging
import re

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud import category as category_crud
from app.crud import product as product_crud
from app.crud.product import ProductFilters
from app.models.product import Product
from app.schemas.chat import ChatResponse, ProductSuggestion
from app.services.faq_data import faq_context_block, find_faq_match

logger = logging.getLogger(__name__)

GEMINI_TIMEOUT_SECONDS = 10.0
GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

MEDICAL_KEYWORDS = (
    "cure", "diagnos", "disease", "symptom", "treatment", "medication", "medicine dosage",
    "prescription", "doctor", "cancer", "diabetes", "blood pressure", "pregnan", "side effect",
    "dosage", "overdose", "infection", "tumor", "surgery", "therapy", "depression", "anxiety",
    "heart disease", "cholesterol", "allergic reaction", "chemotherapy",
)

ESCALATION_KEYWORDS = (
    "human", "real person", "agent", "representative", "escalate", "complaint",
    "not helpful", "speak to someone", "talk to someone", "whatsapp",
)

SAFETY_RESPONSE = (
    "I'm not able to give medical advice, diagnoses, or treatment recommendations, and our products "
    "aren't a substitute for prescribed medication. For anything related to a health condition, "
    "medication, or treatment, please consult a qualified healthcare professional. "
    "I'm happy to help with product info, orders, or store questions instead!"
)

FALLBACK_RESPONSE = (
    "I'm having trouble reaching the assistant service right now. You can browse products and "
    "categories directly, or tap the WhatsApp button below to reach our support team."
)

SYSTEM_PROMPT_TEMPLATE = """You are the Prakruti Organics store assistant, embedded in an organic \
groceries e-commerce site. You help customers with store FAQs, discovering real products, \
understanding categories, and the shopping process (cart, checkout, payment, tracking, cancellation).

Strict rules:
- Only use the FAQ CONTEXT, PRODUCT CONTEXT, and CATEGORY CONTEXT below as your source of truth.
- Never invent product names, prices, stock levels, or health/nutrition benefits that are not \
explicitly listed in the context.
- You are not a medical or nutrition advisor - do not make health claims.
- You are not a general-purpose conversational AI - stay focused on this store.
- If PRODUCT CONTEXT is empty and the user asked about a product, say you couldn't find a matching \
product in the catalog right now, and suggest browsing categories or searching with a different term.
- Keep replies short: 2-4 sentences, friendly, concise.

FAQ CONTEXT:
{faq_context}

PRODUCT CONTEXT (real products matching the user's message, if any):
{product_context}

CATEGORY CONTEXT (real categories in the store):
{category_context}

USER MESSAGE:
{message}
"""


def _contains_any(lower_text: str, keywords: tuple[str, ...]) -> bool:
    return any(keyword in lower_text for keyword in keywords)


STOPWORDS = frozenset({
    "a", "an", "the", "is", "are", "am", "do", "does", "did", "have", "has", "had", "i", "you", "your", "yours",
    "we", "our", "my", "me", "of", "for", "to", "in", "on", "at", "and", "or", "but", "if", "this", "that",
    "these", "those", "it", "its", "can", "could", "would", "should", "will", "shall", "please", "want", "need",
    "looking", "show", "tell", "about", "any", "some", "what", "which", "who", "whom", "how", "when", "where",
    "why", "sell", "store", "product", "products", "item", "items", "buy", "get", "find", "there", "here",
    "with", "from", "by", "as", "be", "been", "being", "also", "just", "really", "much", "many", "good",
    "best", "recommend", "suggestion", "suggest", "help", "hi", "hello", "hey", "category", "categories",
    "catalog", "range", "available",
})


def _extract_keywords(message: str, limit: int = 5) -> list[str]:
    """Pull out meaningful search terms from a free-form message, dropping filler words."""
    words = re.findall(r"[a-zA-Z]+", message.lower())
    keywords = [w for w in words if w not in STOPWORDS and len(w) > 2]
    keywords.sort(key=len, reverse=True)
    return keywords[:limit]


def _search_products(db: Session, message: str, limit: int = 5) -> list[Product]:
    keywords = _extract_keywords(message)
    if not keywords:
        return []
    seen_ids: set = set()
    results: list[Product] = []
    for keyword in keywords:
        filters = ProductFilters(search=keyword, page_size=limit)
        items, _ = product_crud.list_products(db, filters)
        for item in items:
            if item.id not in seen_ids:
                seen_ids.add(item.id)
                results.append(item)
        if len(results) >= limit:
            break
    return results[:limit]


def _primary_image_url(product: Product) -> str | None:
    if not product.images:
        return None
    primary = next((img for img in product.images if img.is_primary), None)
    return (primary or product.images[0]).image_url


def _to_suggestion(product: Product) -> ProductSuggestion:
    return ProductSuggestion(
        id=product.id,
        name=product.name,
        slug=product.slug,
        price=product.price,
        discount_price=product.discount_price,
        image_url=_primary_image_url(product),
        in_stock=product.stock_quantity > 0,
    )


def _product_context_block(products: list[Product]) -> str:
    if not products:
        return "(no matching products found for this message)"
    lines = []
    for p in products:
        stock_note = "in stock" if p.stock_quantity > 0 else "out of stock"
        effective_price = p.discount_price if p.discount_price else p.price
        description = (p.description or "").strip()
        if len(description) > 150:
            description = description[:150].rsplit(" ", 1)[0] + "..."
        lines.append(
            f"- {p.name} (SKU {p.sku}, slug: {p.slug}) - Rs.{effective_price} - {stock_note} - "
            f"Category: {p.category.name} - {description}"
        )
    return "\n".join(lines)


def _category_context_block(db: Session) -> str:
    categories = category_crud.get_multi(db)
    if not categories:
        return "(no categories available)"
    return "\n".join(f"- {c.name} (slug: {c.slug})" for c in categories)


def _call_gemini(prompt: str) -> str | None:
    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not configured; using fallback assistant reply.")
        return None

    url = GEMINI_URL_TEMPLATE.format(model=settings.GEMINI_MODEL)
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 250, "temperature": 0.3},
    }
    try:
        response = httpx.post(url, params={"key": settings.GEMINI_API_KEY}, json=body, timeout=GEMINI_TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except httpx.TimeoutException:
        logger.warning("Gemini API call timed out.")
        return None
    except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
        logger.warning("Gemini API call failed: %s", exc)
        return None


def get_chatbot_reply(db: Session, message: str) -> ChatResponse:
    lower_message = message.lower()

    if _contains_any(lower_message, MEDICAL_KEYWORDS):
        return ChatResponse(reply=SAFETY_RESPONSE, suggested_products=[], escalate_to_whatsapp=False)

    escalate = _contains_any(lower_message, ESCALATION_KEYWORDS)

    faq_match = find_faq_match(lower_message)
    if faq_match is not None:
        return ChatResponse(
            reply=faq_match.answer,
            suggested_products=[],
            escalate_to_whatsapp=escalate or faq_match.escalate,
        )

    products = _search_products(db, message)
    suggestions = [_to_suggestion(p) for p in products]

    prompt = SYSTEM_PROMPT_TEMPLATE.format(
        faq_context=faq_context_block(),
        product_context=_product_context_block(products),
        category_context=_category_context_block(db),
        message=message,
    )
    gemini_reply = _call_gemini(prompt)

    if gemini_reply is None:
        return ChatResponse(reply=FALLBACK_RESPONSE, suggested_products=suggestions, escalate_to_whatsapp=True)

    return ChatResponse(reply=gemini_reply, suggested_products=suggestions, escalate_to_whatsapp=escalate)
