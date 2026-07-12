from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.db import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    preferred_provider = Column(
        String,
        nullable=False,
        default="groq"
    )

    preferred_model = Column(
        String,
        nullable=True
    )

    response_style = Column(
        String,
        nullable=False,
        default="balanced"
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    temperature = Column(
        Float,
        default=0.7,
        nullable=False
    )

    max_tokens = Column(
        Integer,
        default=1024,
        nullable=False
    )

    auto_scroll = Column(
        Boolean,
        default=True,
        nullable=False
    )

    typewriter_animation = Column(
        Boolean,
        default=True,
        nullable=False
    )

    show_analytics = Column(
        Boolean,
        default=True,
        nullable=False
    )

    theme = Column(
        String,
        default="dark",
        nullable=False
    )

    # Relationship to User model
    user = relationship(
        "User",
        back_populates="preferences"
    )