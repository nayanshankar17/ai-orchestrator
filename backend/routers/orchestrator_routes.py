from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.user_preference import UserPreferences
from app.models.chat_session import ChatSession
from app.models.message import Message

from orchestrator.orchestrate import run_orchestration

router = APIRouter(
    tags=["Orchestrator"] # swagger group name
)

# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    # Multiple providers can be selected(if user selects only one provider, still the smart mode is not used then, we directly call the selected provider without routing logic)
    providers: list[str] = []
    session_id: str | None = None


@router.post("/orchestrate") # POST /orchestrate
async def orchestrate(
    request: PromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user preferences
    statement = select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    preferences = db.execute(statement).scalar_one_or_none()

    if len(request.providers) == 0 and preferences and preferences.preferred_provider:
        request.providers = [
            preferences.preferred_provider
        ]

    # Fetch previous messages for context history
    history = []
    if request.session_id:
        session_stmt = select(ChatSession).where(ChatSession.id == request.session_id)
        session_obj = db.execute(session_stmt).scalar_one_or_none()
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found.")
        if session_obj.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied.")
        
        msg_stmt = select(Message).where(Message.session_id == request.session_id).order_by(Message.created_at.asc())
        db_messages = db.execute(msg_stmt).scalars().all()
        history = [{"role": msg.role, "content": msg.content} for msg in db_messages]

    return await run_orchestration(
        request.prompt,
        request.providers,
        current_user,
        history
    )
