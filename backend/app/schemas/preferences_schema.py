from typing import Literal

from pydantic import BaseModel, model_validator
from datetime import datetime
from uuid import UUID


SUPPORTED_GROQ_MODELS = {"llama-3.3-70b-versatile"}
SUPPORTED_GEMINI_MODELS = {"gemini-2.5-flash"}
SUPPORTED_MODELS_BY_PROVIDER = {
    "groq": SUPPORTED_GROQ_MODELS,
    "gemini": SUPPORTED_GEMINI_MODELS,
}

# class PreferencesUpdate is used for updating user preferences. It contains all the fields that can be updated, with default values provided for each field. This allows users to update their preferences without needing to provide values for every field.
class PreferencesUpdate(BaseModel):

    # AI Preferences
    preferred_provider: Literal["groq", "gemini"] = "groq"
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

    @model_validator(mode="after")
    def validate_preferred_model(self):
        if self.preferred_model is None:
            return self

        cleaned_model = self.preferred_model.strip()
        if not cleaned_model:
            self.preferred_model = None
            return self

        allowed_models = SUPPORTED_MODELS_BY_PROVIDER.get(self.preferred_provider, set())
        if cleaned_model not in allowed_models:
            raise ValueError(
                f"preferred_model must be one of: {', '.join(sorted(allowed_models))} for {self.preferred_provider}"
            )

        self.preferred_model = cleaned_model
        return self


# class PreferencesResponse is used for returning user preferences in API responses. It contains all the fields that are stored in the database, including the user's ID and timestamps for when the preferences were created and last updated. The from_attributes configuration allows FastAPI/Pydantic to convert SQLAlchemy ORM objects directly into JSON responses.
class PreferencesResponse(BaseModel):

    id: UUID
    user_id: UUID

    preferred_provider: Literal["groq", "gemini"]
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