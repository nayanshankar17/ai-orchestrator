# THIS FILE IS USED TO IDENTIFY CHATS SECURELY, this file acts as main.py for chat_history part of the app

from fastapi import APIRouter, Depends # APIRouter organizes chat endpoints
from sqlalchemy.orm import Session # Database session type

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat_schema import createChat, ChatResponse

router = APIRouter(
    prefix="/chat", # All routes start with /chat
    tags=["Chat"] # swagger group name
)

@router.post(
        "/send", # POST /chat/send
        response_model=ChatResponse
    ) 
def send_chat(
    chat: createChat,
    current_user: User = Depends(get_current_user),
    db: Session =  Depends(get_db)
):
    # TEMPORARY AI RESPONSE
    # Later this will come from orchestrator
    ai_response = f"AI response for: {chat.prompt}"

    new_chat = Chat(
        user_id = current_user.id, # Chat owner
        prompt = chat.prompt,
        response = ai_response,
        provider="groq" # Temporary provider name
    )

    db.add(new_chat) # Add chat to database session
    db.commit() # Save permanently
    db.refresh(new_chat) # Refresh object from PostgreSQL

    return new_chat