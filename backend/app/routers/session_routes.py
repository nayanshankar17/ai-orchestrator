# we did not create separate service and repository layers for session management, as the logic is quite simple and straightforward, and 
# can be handled directly in the router. The session management mainly involves creating sessions, adding messages to sessions, and 
# retrieving sessions and their messages, which are basic CRUD operations that can be efficiently managed within the router itself without 
# the need for additional abstraction layers. This approach helps to keep the codebase simpler and more maintainable, while still adhering 
# to good design principles. However, if the session management logic becomes more complex in the future, we can always refactor it into 
# separate service and repository layers as needed.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.chat_session import ChatSession

from app.schemas.session_schema import sessionCreate, sessionUpdate, sessionResponse, messageCreate, messageResponse

router = APIRouter(
    prefix="/session", # All routes start with /session
    tags=["Session"], #swagger group name
)



# ROUTE TO CREATE NEW SESSION
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

    db.add(new_session) # Add session to a user 
    db.commit()
    db.refresh(new_session) # Refresh object from PostgreSQL

    return new_session



# ROUTE TO RENAME AN EXISTING SESSION
@router.put(
    "/{session_id}/rename",
    response_model=sessionResponse
)
def rename_session(
    session_id: str,
    session_data: sessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = session_data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Session title cannot be empty")

    statement = select(ChatSession).where(ChatSession.id == session_id)
    result = db.execute(statement)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    session.title = title
    db.commit()
    db.refresh(session)
    return session


# ROUTE TO DELETE AN EXISTING SESSION
@router.delete(
    "/{session_id}"
)
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    statement = select(ChatSession).where(ChatSession.id == session_id)
    result = db.execute(statement)
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}


# ROUTE TO GET THE LIST OF SESSIONS OF A SINGLE USER FROM THE DB, LATER SED TO CREATE THE SIDEBAR AS IN CHATGPT
@router.get(
    "/list", # GET /session/list
    response_model=list[sessionResponse]
)
def gest_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Select(Query) all chats where owner = logged-in user, sort newest first
    statement = select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()) # this is a query

# Think of:
#   result = db.execute(statement) as: Run SQL

    result = db.execute(statement) # Now SQLAlchemy sends the query to PostgreSQL.
    sessions = result.scalars().all() # Extract list of Chat objects, this converts SQLALchemy result to a list of objects
    return sessions



#ROUTE TO ADD NEW MESSAGE IN A SESSION
@router.post(
    "/{session_id}/message", # POST /session/{session_id}/message
    response_model=messageResponse,
)
def add_message(
    session_id: str,
    message_data: messageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #find session
    statement = statement = select(ChatSession).where(ChatSession.id == session_id) #query to find the session
    result = db.execute(statement) # Now SQLAlchemy sends the query to PostgreSQL.
    session = result.scalar_one_or_none() # extracts either one(if session exists) or none(if session doesnt exist, 404). overall one ROW(id, session_id, role, ...) selected
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        ) 
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    
    #create new message
    new_message = Message(
        session_id=session.id,
        role=message_data.role,
        provider=message_data.provider,
        content=message_data.content,
        latency=message_data.latency,
        token_count=message_data.token_count,
        status=message_data.status,
    )
    db.add(new_message) # Add new message to session
    db.commit() #save it permanently
    db.refresh(new_message) # Refresh object from PostgreSQL
    return new_message



# ROUTE TO GET THE MESSAGES IN A SESSION
@router.get(
    "/{session_id}", #GET /session/{created_at}
    response_model=list[messageResponse]
)
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Select(Query) all chats where owner = logged-in user
    statement = select(ChatSession).where(ChatSession.id == session_id)

    result =  db.execute(statement)
    session = result.scalar_one_or_none() # extracts either one(if session exists) or none(if session doesnt exist, 404). overall one ROW(id, session_id, role, ...) selected

    if not session:
        raise HTTPException(
            status_code=404,
            detail="session does not exist"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="access denied"
        )
    
    statement = select(Message).where(Message.session_id == session.id).order_by(Message.created_at.asc()) # query
    result = db.execute(statement)
    messages = result.scalars().all() # Extract list of Chat objects, this converts SQLALchemy result to a list of objects
    return messages
    