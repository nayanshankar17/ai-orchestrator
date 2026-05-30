from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.chat_session import ChatSession

from app.schemas.session_schema import sessionCreate, sessionResponse, messageCreate, messageResponse

router = APIRouter(
    prefix="/session", # All routes start with /session
    tags=["session"], #swagger group name
)

@router.post(
    "/create", # POST /sesion/create
    response_model=sessionResponse
)
def create_session(
    session_data: sessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_session = ChatSession(
        user_id = current_user.id,
        title = session_data.title
    )  

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session
