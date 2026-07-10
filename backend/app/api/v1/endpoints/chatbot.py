"""
AI chatbot endpoints: FAQ answers, product recommendations, WhatsApp handoff.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    session_id: str
    message: str


@router.post("/message")
def send_message(payload: ChatMessage):
    """
    Send a user message to the AI chatbot and get a reply.
    TODO: implement using OpenAI/Gemini API with a system prompt covering
    FAQs, product catalog context, and a WhatsApp handoff trigger.
    """
    raise NotImplementedError


@router.get("/history/{session_id}")
def get_chat_history(session_id: str):
    """Retrieve prior messages for a chat session. TODO: implement."""
    raise NotImplementedError
