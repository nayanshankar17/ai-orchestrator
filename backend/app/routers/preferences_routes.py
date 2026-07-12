from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.user_preference import UserPreferences
from app.schemas.preferences_schema import PreferencesUpdate, PreferencesResponse

router = APIRouter(
    prefix="/preferences", # All routes start with /preferences
    tags=["Preferences"], #swagger group name
)


# Route to get user preferences, if not found return default empty preferences
@router.get(
    "/",
    response_model=PreferencesResponse
)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    statement = select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    [Preferences] = db.execute(statement).scalar_one_or_none()

    if not Preferences:
        # If no preferences found, return default empty preferences
        return PreferencesResponse(
            preferred_provider=None,
            preferred_model=None,
            preferred_style=None
        )

    return Preferences


# Route to update or create user preferences
@router.put(
    "/",
    response_model=PreferencesResponse
)
def update_preferences(
    preference_data: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    statement = select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    user_preferences = db.execute(statement).scalar_one_or_none()

    # Create new preferences if they don't exist
    if user_preferences is None:
        raise HTTPException(
            status_code=404,
            detail="Preferences not found."
        )

    # Update existing preferences
    else:
        
        user_preferences.preferred_provider = preference_data.preferred_provider
        user_preferences.preferred_model = preference_data.preferred_model
        user_preferences.response_style = preference_data.response_style

        user_preferences.temperature = preference_data.temperature
        user_preferences.max_tokens = preference_data.max_tokens

        user_preferences.auto_scroll = preference_data.auto_scroll
        user_preferences.typewriter_animation = preference_data.typewriter_animation
        user_preferences.show_analytics = preference_data.show_analytics
        user_preferences.render_markdown = preference_data.render_markdown
        user_preferences.code_highlighting = preference_data.code_highlighting

        user_preferences.theme = preference_data.theme
        user_preferences.font_size = preference_data.font_size
        user_preferences.compact_mode = preference_data.compact_mode
        user_preferences.sidebar_collapsed = preference_data.sidebar_collapsed

    db.commit()
    db.refresh(user_preferences)
    return user_preferences