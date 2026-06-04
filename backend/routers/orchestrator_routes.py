# This file defines the API routes related to the Orchestrator functionality. It includes a single POST endpoint /orchestrate that accepts
# a prompt and a list of providers, and returns the orchestrated response from the selected providers.

from fastapi import APIRouter
from pydantic import BaseModel

# from fastapi import Depends
# from sqlalchemy.orm import Session

# from app.database.db import get_db
# from app.auth.dependencies import get_current_user

# from app.models.user import User
# from app.models.user_preference import UserPreferences

from orchestrator.orchestrate import run_orchestration

router = APIRouter(
    tags=["Orchestrator"] # swagger group name
)

# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    # Multiple providers can be selected(if user selects only one provider, still the smart mode is not used then, we directly call the selected provider without routing logic)
    providers: list[str] = []


@router.post("/orchestrate") # POST /orchestrate
async def orchestrate(
    request: PromptRequest,
    # db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    # preferences = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()

    # if (len(request.providers) == 0 and preferences and preferences.preferred_provider ):
    #     request.providers = [
    #         preferences.preferred_provider
    #     ]

    return await run_orchestration(
        request.prompt,
        request.providers
    )