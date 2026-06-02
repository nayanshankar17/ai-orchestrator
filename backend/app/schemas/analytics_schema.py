from pydantic import BaseModel


# This schema is for the summary of all analytics, it includes total users, total sessions and total messages
class AnalyticsSummary(BaseModel):
    total_users: int
    total_sessions: int
    total_messages: int


# This schema is for the summary of the logged-in user, it includes total sessions and total messages of the user
class MyAnalyticsSummary(BaseModel):
    total_sessions: int
    total_messages: int


# This schema is for the summary of a single session, it includes the session title, total messages, user messages and assistant messages
class SessionAnalyticsSummary(BaseModel):
    session_title: str
    total_messages: int
    user_messages: int
    assistant_messages: int
    system_messages: int