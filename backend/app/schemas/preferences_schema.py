from pydantic import BaseModel

# Request body used when user updates preferences
class PreferencesUpdate(BaseModel):
    preferred_provider: str | None = None
    preferred_model: str | None = None
    preferred_style: str | None = None


# Response returned when preferences are fetched or updated
class PreferencesResponse(BaseModel):
    preferred_provider: str | None
    preferred_model: str | None
    preferred_style: str | None

    # Allows FastAPI/Pydantic to convert SQLAlchemy ORM objects directly into JSON responses
    class Config:
        from_attributes = True