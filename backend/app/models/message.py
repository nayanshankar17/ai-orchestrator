import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
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
        ForeignKey("chat_sessions.id"),
        nullable=False
    )


    # Message sender
    # Example:
    # user
    # assistant
    role = Column(
        String,
        nullable=False
    )


    # Actual message content
    content = Column(
        Text,
        nullable=False
    )


    # Message timestamp
    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )


    # Message belongs to one session
    session = relationship(
        "ChatSession",
        back_populates="messages"
    )