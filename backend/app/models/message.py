# MODEL FOR MESSAGES IN A SESSION

# Visualisation:
#   id    | session_id |        role          |   content        |  timeStamp    
#_________|____________|______________________|__________________|____________
#   1     |  1         |  user                |  hello           | ..
#   2     |  1         |  assisstant          |  hi, how are you?| ..
#   3     |  1         |  ...                 |  ...             | ..
#   ..    |  ..        |  ...                 |  ...             | ..
#   11    |  2         |  user                |  hello           | ..
#   12    |  2         |  assisstant          |  hi, how are you?| ..
#   13    |  2         |  ...                 |  ...             | ..
#   ..    |  ..        |  ...                 |  ...             | ..

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Base model
from app.database.db import Base

# Message table
class Message(Base):

    __tablename__ = "messages"

    # Unique message ID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    # Parent session ID
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chat_sessions.id"), #every message must belong to a session
        nullable=False
    )

    # tells who sent the message(user, assisstant, system) all are stored in one table, only role changes
    role = Column(
        String,
        nullable=False
    )

    # Stores messages in the convo
    content = Column(
        Text,
        nullable=False
    )

    # Message timestamp
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # AI provider (Gemini, Groq, GPT...)
    provider = Column(
        String,
        nullable=True      # NULL for user messages
    )

    # Response time in seconds
    latency = Column(
        Float,
        nullable=True
    )

    # Number of tokens used
    token_count = Column(
        Integer,
        nullable=True
    )

    # success / failed
    status = Column(
        String,
        nullable=True
    )

    # Message belongs to one session
    session = relationship(
        "ChatSession",
        back_populates="messages"
    )