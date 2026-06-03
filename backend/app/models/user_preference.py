from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship

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
        nullable=True
    )

    preferred_model = Column(
        String,
        nullable=True
    )

    preferred_style = Column(
        String,
        nullable=True
    )


    # Relationship to User model
    user = relationship(
        "User",
        back_populates="preferences"
    )