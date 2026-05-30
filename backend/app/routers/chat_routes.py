# THIS FILE IS USED TO IDENTIFY CHATS SECURELY, this file acts as main.py for chat_history part of the app
# ADD CHAT, GET HISTORY, DELETE CHAT

from fastapi import APIRouter, Depends, HTTPException # APIRouter organizes chat endpoints
from sqlalchemy.orm import Session # Database session type
from sqlalchemy.future import select 

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat_schema import CreateChat, ChatResponse, ChatHistoryResponse

router = APIRouter(
    prefix="/chat", # All routes start with /chat
    tags=["Chat"] # swagger group name
)

# ROUTES TO STORE NEW CHAT IN HISTORY OF USER USING USER_ID IN DB
@router.post(
        "/send", # POST /chat/send
        response_model=ChatResponse
    ) 
def send_chat(
    chat: CreateChat,
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
        provider="groq" # # Temporary hardcoded provider name
    )

    db.add(new_chat) # Add chat to database session
    db.commit() # Save permanently
    db.refresh(new_chat) # Refresh object from PostgreSQL

    return new_chat
                
# ROUTE TO GET CHAT HISTORY OF A PARTICULAR USER USING THEIR ID FROM DB
@router.get(
    "/history", #GET /chat/history
    response_model=list[ChatHistoryResponse]
)
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Select(Query) all chats where owner = logged-in user, sort newest first
    statement = select(Chat).where(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()) # this is the query

    result = db.execute(statement) # Execute query

    chats = result.scalars().all()# Extract list of Chat objects, this converts SQLALchemy result to a list of objects

    return chats

#ROUTE TO DELETE A CHAT FROM DB
@router.delete("/delete{chat_id}")
def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db) 
):
    statement = select(Chat).where(Chat.id == chat_id) # find the chat from DB which the user wants to delete, this is a query


# Think of:
#   result = db.execute(statement) as: Run SQL
#   chat = result.scalar_one_or_none() as: Give me the actual Chat object from the result

    result = db.execute(statement) # Now SQLAlchemy sends the query to PostgreSQL.

    chat = result.scalar_one_or_none() # extracts either one(if chat exists) or none(if chat doesnt exist, 404). overall one ROW(id, chat_id, prompy, ...) selected

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found."
        )
    
    # Ownership check
    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this chat."
        )
    
    db.delete(chat)

    db.commit() #save changes

    return {
        "message": "Chat deleted successfully"
    }