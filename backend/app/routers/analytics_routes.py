from fastapi import APIRouter, Depends, HTTPException
from requests import session
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.chat_session import ChatSession
from app.schemas.analytics_schema import AnalyticsSummary, MyAnalyticsSummary, SessionAnalyticsSummary

router = APIRouter(
    prefix="/analytics", # All routes start with /analytics
    tags=["Analytics"], # swagger group name
)


# ROUTE TO GET SUMMARY OF ALL USERS (TOTAL USERS, SESSIONS, MESSAGES)
@router.get(
    "/summary", # GET /analytics/summary
    response_model=AnalyticsSummary
)
def get_summary(
    db: Session = Depends(get_db)
):
    # Total users
    total_users = db.query(User).count()

    # Total sessions
    total_sessions = db.query(ChatSession).count()

    # Total messages
    total_messages = db.query(Message).count()

    # DATA IS NOT RETURNED AS A DICTIONARY BUT AS A PYDANTIC MODEL OBJECT, THIS ENSURES THE RESPONSE ALWAYS FOLLOWS THE DEFINED SCHEMA
    return AnalyticsSummary(
        total_users=total_users,
        total_sessions=total_sessions,
        total_messages=total_messages
    )


# ROUTE TO GET SUMMARY OF THE LOGGED-IN USER (TOTAL SESSIONS, MESSAGES)
@router.get(
    "/my_summary", # GET /analytics/my_summary
    response_model=MyAnalyticsSummary
)
def get_my_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Total sessions of the user
    total_sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).count()

    # Total messages of the user (join Message and ChatSession to filter by user_id), searches after combining the tables
    total_messages = db.query(Message).join(ChatSession).filter(ChatSession.user_id == current_user.id).count()

    return MyAnalyticsSummary(
        total_sessions=total_sessions,
        total_messages=total_messages
    )


# ROUTE TO GET SUMMARY OF A SINGLE SESSION (TOTAL MESSAGES, USER MESSAGES, ASSISTANT MESSAGES)
@router.get(
    "/session_summary/{session_id}", # GET /analytics/session_summary/1
    response_model=SessionAnalyticsSummary
)
def get_session_summary(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #find session, check if it belongs to the user
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
        
    total_messages = db.query(Message).filter(Message.session_id == session.id).count()
    user_message = db.query(Message).filter(Message.session_id == session.id, Message.role == "user").count()
    assistant_message = db.query(Message).filter(Message.session_id == session.id, Message.role == "assistant").count()

    return SessionAnalyticsSummary(
        session_title=session.title,
        total_messages=total_messages,
        user_messages=user_message,
        assistant_messages=assistant_message
    )