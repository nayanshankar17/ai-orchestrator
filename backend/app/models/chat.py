# MODEL FOR CHAT HISTORY DATABASE TABLES
# in this file datatypes are defined as per DataBase

from sqlalchemy import Column, String, Text, ForeignKey, DateTime #these are the datatypes of columns of table
from datetime import datetime
import uuid # Used for unique chat IDs


# PostgreSQL UUID datatype support
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship # Used for table relationships

from app.database.db import Base # All SQLAlchemy models inherit from Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(
        UUID(as_uuid=True), # PostgreSQL UUID type
        primary_key=True, # Primary key means unique identifier
        default=uuid.uuid4, # Automatically generate UUID 
    )

    # Links chat to user table
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"), # Foreign key reference
        nullable=False
    )

    prompt = Column(
        Text,
        nullable=False
    )

    response = Column(
        Text,
        nullable= False
    )

    provider = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime, #datatype: stores date and time
        default=datetime.utcnow # Automatically use current UTC time
    )

    # Relationship back to User model (Allows: chat.user)
    user = relationship(
        "User", # related model name
        back_populates="chats" # Connect both relationship sides
    )
