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
    result = db.execute(statement).scalar_one_or_none()

    if not result:
        # If no preferences found, return default empty preferences
        return PreferencesResponse(
            preferred_provider=None,
            preferred_model=None,
            preferred_style=None
        )

    return result



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
    if not user_preferences:
        user_preferences = UserPreferences(
            user_id=current_user.id,
            preferred_provider=preference_data.preferred_provider,
            preferred_model=preference_data.preferred_model,
            preferred_style=preference_data.preferred_style
        )
        db.add(user_preferences)

    # Update existing preferences
    else:
        user_preferences.preferred_provider = preference_data.preferred_provider
        user_preferences.preferred_model = preference_data.preferred_model
        user_preferences.preferred_style = preference_data.preferred_style

    db.commit()
    db.refresh(user_preferences)
    return user_preferences