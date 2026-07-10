"""
AI chatbot service wrapping OpenAI/Gemini for FAQ answering and product
recommendations, with a WhatsApp handoff trigger for complex queries.
TODO: implement prompt construction, product-catalog grounding, and handoff logic.
"""
from app.core.config import settings

SYSTEM_PROMPT = """
You are a helpful shopping assistant for a premium organic products store.
Answer FAQs, recommend products from the catalog, help customers navigate
the site, and offer to connect them to WhatsApp support for anything you
cannot resolve.
"""


def get_chatbot_reply(session_id: str, message: str) -> str:
    raise NotImplementedError


def should_handoff_to_whatsapp(message: str) -> bool:
    raise NotImplementedError
