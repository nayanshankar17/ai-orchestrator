from app.models.user import User
from app.models.chat_session import ChatSession
from app.models.message import Message

# database, current_user are passed as an argument to the service methods, this way we can keep the service layer independent of the database implementation 

class AnalyticsService:

    @staticmethod # static method is used to define a method that belongs to the class and can be called without creating an instance of the class, it does not have access to the instance (self) or class (cls) variables, it is just a regular function that is namespaced inside the class for better organization and readability.
    def get_summary(db):
        return {
            "total_users": db.query(User).count(),
            "total_sessions": db.query(ChatSession).count(),
            "total_messages": db.query(Message).count()
        }
    
    @staticmethod
    def get_my_summary(db, current_user):
        return {
            "total_sessions": db.query(ChatSession).filter(ChatSession.user_id == current_user.id).count(),
            # join Message and ChatSession to filter by user_id, searches after combining the tables
            "total_messages": db.query(Message).join(ChatSession).filter(ChatSession.user_id == current_user.id).count() 
        }
    
    @staticmethod
    def get_session_summary(db, session):
        return{
                "session_title": session.title,
                "total_messages": db.query(Message).filter(Message.session_id == session.id).count(),
                # count messages by role
                    "user_messages": db.query(Message).filter(Message.session_id == session.id, Message.role == "user").count(),
                    "assistant_messages": db.query(Message).filter(Message.session_id == session.id, Message.role == "assistant").count(),
                    "system_messages": db.query(Message).filter(Message.session_id == session.id, Message.role == "system").count()
        }