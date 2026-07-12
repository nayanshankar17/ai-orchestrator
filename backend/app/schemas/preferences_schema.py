from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

# class PreferencesUpdate is used for updating user preferences. It contains all the fields that can be updated, with default values provided for each field. This allows users to update their preferences without needing to provide values for every field.
class PreferencesUpdate(BaseModel):

    # AI Preferences
    preferred_provider: str = "groq"
    preferred_model: str | None = None
    response_style: str = "balanced"
    temperature: float = 0.7
    max_tokens: int = 1024

    # Chat Preferences
    auto_scroll: bool = True
    typewriter_animation: bool = True
    show_analytics: bool = True
    render_markdown: bool = True
    code_highlighting: bool = True

    # UI Preferences
    theme: str = "dark"
    font_size: int = 16
    compact_mode: bool = False
    sidebar_collapsed: bool = False


# class PreferencesResponse is used for returning user preferences in API responses. It contains all the fields that are stored in the database, including the user's ID and timestamps for when the preferences were created and last updated. The from_attributes configuration allows FastAPI/Pydantic to convert SQLAlchemy ORM objects directly into JSON responses.
class PreferencesResponse(BaseModel):

    id: UUID
    user_id: UUID

    preferred_provider: str
    preferred_model: str | None
    response_style: str
    temperature: float
    max_tokens: int

    auto_scroll: bool
    typewriter_animation: bool
    show_analytics: bool
    render_markdown: bool
    code_highlighting: bool

    theme: str
    font_size: int
    compact_mode: bool
    sidebar_collapsed: bool

    created_at: datetime
    updated_at: datetime

    # Allows FastAPI/Pydantic to convert SQLAlchemy ORM objects directly into JSON responses
    class Config:
        from_attributes = True