# THIS FILE IS USED TO VALIDATE INCOMING REQUESTS FOR CHATS, ENSURE CORRECT DATA-TYPES (eg: name = 123, REJECTED) 
# in this file datatypes are defined as per Python

from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

# Schema for incoming chat request, used when user sends prompt to AI
class createChat(BaseModel):
    prompt: str

# Schema for API response, used when backend returns saved chat data
class ChatResponse(BaseModel):
    id: UUID #unique chat id
    prompt: str
    response: str
    provider: str #gemini/groq
    created_at: datetime

    # Pydantic configuration
    class Config:
        # Allows automatic conversion from SQLAlchemy ORM objects to JSOn bcoz FastAPI needs JSON
        from_attributes = True

