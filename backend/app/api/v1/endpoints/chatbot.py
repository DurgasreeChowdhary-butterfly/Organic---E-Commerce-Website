"""AI Assistant endpoint: FAQ answers, real product discovery, WhatsApp handoff."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rate_limit import enforce_rate_limit
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chatbot_service

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
def send_message(payload: ChatRequest, request: Request, db: Session = Depends(get_db)) -> ChatResponse:
    """
    Send a user message to the AI assistant and get a grounded reply.
    Open to guests and authenticated users alike - no auth required.
    """
    client_key = request.client.host if request.client else payload.session_id
    enforce_rate_limit(client_key)
    return chatbot_service.get_chatbot_reply(db, payload.message)
