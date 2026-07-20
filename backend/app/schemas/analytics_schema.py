from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


# # Admin Analytics
# class AnalyticsSummary(BaseModel):
#     total_users: int
#     total_sessions: int
#     total_messages: int

# Logged-in User Analytics
class MyAnalyticsSummary(BaseModel):
    total_sessions: int
    total_messages: int
    favorite_provider: str | None = None
    average_messages_per_session: float
    last_chat_at: datetime | None = None

# Provider Usage (this is used in SessionAnalyticsSummary to show how many messages were sent by each provider in a session)
class ProviderUsage(BaseModel):
    provider: str | None = None #None is for user messsages/
    count: int

# Session Analytics
class SessionAnalyticsSummary(BaseModel):
    session_title: str
    total_messages: int
    user_messages: int
    assistant_messages: int
    system_messages: int
    provider_usage: list[ProviderUsage]

# Daily Activity
class DailyActivity(BaseModel):
    date: date
    messages: int

# Conversation Statistics
class ConversationStatistics(BaseModel):
    average_messages_per_session: float
    longest_session: int
    shortest_session: int

# Recent Activity
class RecentActivity(BaseModel):
    session_id: UUID
    session_title: str
    provider: str | None = None
    created_at: datetime