# THIS FILE IS USED TO VALIDATE INCOMING REQUESTS FOR SESSIONS, ENSURE CORRECT DATA-TYPES (eg: name = 123, REJECTED) 
# in this file datatypes are defined as per Python

# pydantic is a python lib used for data validation, parsing, serialization
# basemodel acts as a bluprint for API data
# Eg: 
# from pydantic import BaseModel
# class SessionCreate(BaseModel):
#     title: str
# I expect a JSON object
# containing a title field
# and title must be a string

from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from app.enums.messsage_role import MessageRole # to use the enum for message role, this ensures only allowed values are accepted for role field

# Request body for creating session
class sessionCreate(BaseModel):
    title: str

class sessionUpdate(BaseModel):
    title: str

# Response when session is returned
class sessionResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime

    # Pydantic configuration
    class config:
        from_attributes = True # Allows automatic conversion from SQLAlchemy ORM objects to JSOn bcoz FastAPI needs JSON

class messageCreate(BaseModel):
    role: MessageRole
    provider: str | None = None
    content: str
    latency: float | None = None
    token_count: int | None = None
    status: str | None = None

class messageResponse(BaseModel):
    id: UUID
    role: MessageRole
    provider: str | None = None
    content: str
    latency: float | None = None
    token_count: int | None = None
    status: str | None = None
    created_at: datetime
    class Config:
        from_attributes = True
        