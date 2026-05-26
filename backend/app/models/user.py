from sqlalchemy import Column, String

from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database.db import Base

# Create User model, this becomes a table in PostgreSQL
class User(Base):
    __tablename__ = "users"

    # Create SQL column named "id"
    id = Column(
        UUID(as_uuid=True), # PostgreSQL UUID type
        primary_key=True, # Primary key means unique identifier
        default=uuid.uuid4, # Automatically generate UUID
    )

    name =  Column(
        String, # datatype
        nullable = False, # field cannot be empty
    )

    email = Column(
        String,
        unique=True, # no duplicate email_id's allowed for multiple users
        nullable=False,
    )
    password_hash = Column(
        String,
        nullable=False,
    )
