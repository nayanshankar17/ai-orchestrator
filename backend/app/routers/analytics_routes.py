from fastapi import APIRouter, Depends, HTTPException
from requests import session
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.db import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.chat_session import ChatSession
from app.schemas.analytics_schema import MyAnalyticsSummary, ProviderUsage, SessionAnalyticsSummary, DailyActivity, ConversationStatistics, RecentActivity
from app.services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/analytics", # All routes start with /analytics
    tags=["Analytics"], # swagger group name
)


# ROUTE TO GET SUMMARY OF ALL USERS (TOTAL USERS, SESSIONS, MESSAGES)
# @router.get(
#     "/summary", # GET /analytics/summary
#     response_model=AnalyticsSummary
# )
# def get_summary(
#     db: Session = Depends(get_db)
# ):
#     summary = AnalyticsService.get_summary(db) #db is passed as an argument to the service method
#     return AnalyticsSummary(**summary)# **summary is used to unpack the dictionary returned by the service method and pass it to the Pydantic model


# ROUTE TO GET SUMMARY OF THE LOGGED-IN USER (TOTAL SESSIONS, MESSAGES)
@router.get(
    "/my_summary", # GET /analytics/my_summary
    response_model=MyAnalyticsSummary
)
def get_my_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = AnalyticsService.get_my_summary(db, current_user) #db and current_user are passed as an argument to the service method
    return MyAnalyticsSummary(**summary) 


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
    
    summary = AnalyticsService.get_session_summary(db, session) #db and session are passed as an argument to the service method
    return SessionAnalyticsSummary(**summary)

# ROUTE TO GET PROVIDER USAGE 
@router.get(
    "/provider_usage",
    response_model=list[ProviderUsage]
)
def get_provider_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_provider_usage(db, current_user)

# ROUTE TO GET DAILY ACTIVITY OF THE LOGGED-IN USER (MESSAGES PER DAY)
@router.get(
    "/daily_activity",
    response_model=list[DailyActivity]
)
def get_daily_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_daily_activity(db, current_user)

# ROUTE TO GET CONVERSATION STATISTICS OF THE LOGGED-IN USER (AVERAGE MESSAGES PER SESSION, LONGEST SESSION, SHORTEST SESSION)
@router.get(
    "/conversation_statistics",
    response_model=ConversationStatistics
)
def get_conversation_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_conversation_statistics(db, current_user)

# ROUTE TO GET RECENT ACTIVITY OF THE LOGGED-IN USER (LAST 10 SESSIONS)
@router.get(    
    "/recent_activity",
    response_model=list[RecentActivity]
)
def get_recent_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_recent_activity(db, current_user)