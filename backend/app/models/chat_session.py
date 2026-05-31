# MODEL FOR CHAT SESSIONS DATABASE, MANY SESSIONS -> ONE USER
# 
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Base model
from app.database.db import Base

from app.models.message import Message


class ChatSession(Base):

    __tablename__ = "chat_sessions"

    #session id(unique id for each session)
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Session owner(id  of user)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    # Conversation title
    title = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Session belongs to one user
    user = relationship(
        "User",
        back_populates="sessions"  #one user has many sessions 
    )

    # One session contains many messages
    messages = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan" # |
    )                                # |
                                     # V
    # An orphan is a child record whose parent no longer exists. if we delete the session, the messages from the messages table still point 
    # to the session but the session is deleted so they are orphan now. this commands deleted all message which get orphan if we delete the 
    # session.