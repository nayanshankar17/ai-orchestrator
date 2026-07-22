from app.models.user import User
from app.models.chat_session import ChatSession
from app.models.message import Message
from sqlalchemy import func

# AnalyticsService
# │
# ├── get_summary()
# ├── get_my_summary()
# ├── get_session_summary()
# │
# ├── get_provider_usage()
# ├── get_daily_activity()
# ├── get_chat_statistics()
# └── get_recent_activity()


# database, current_user are passed as an argument to the service methods, this way we can keep the service layer independent of the database implementation 

class AnalyticsService:

    # @staticmethod # static method is used to define a method that belongs to the class and can be called without creating an instance of the class, it does not have access to the instance (self) or class (cls) variables, it is just a regular function that is namespaced inside the class for better organization and readability.
    # def get_summary(db):
    #     return {
    #         "total_users": db.query(User).count(),
    #         "total_sessions": db.query(ChatSession).count(),
    #         "total_messages": db.query(Message).count()
    #     }
    

    # func to get summary of the logged-in user 
    @staticmethod
    def get_my_summary(db, current_user):

        sessions_query = db.query(ChatSession).filter(ChatSession.user_id == current_user.id)

        messages_query = (
            db.query(Message)
            .join(ChatSession)
            .filter(ChatSession.user_id == current_user.id)
        )

        total_sessions = sessions_query.count()
        total_messages = messages_query.count()

        favorite_provider = (
            sessions_query
            .with_entities(Message.provider)
            .group_by(Message.provider)
            .order_by(func.count(Message.provider).desc())
            .first()
        )

        last_session = (
            sessions_query
            .order_by(ChatSession.created_at.desc())
            .first()
        )

        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "favorite_provider": favorite_provider[0] if favorite_provider else None,
            "average_messages_per_session": (
                total_messages / total_sessions if total_sessions > 0 else 0
            ),
            "last_chat_at": (
                last_session.created_at if last_session else None
            )
        }
    
    # func to get summary of a single session 
    @staticmethod
    def get_session_summary(db, session):
        
        messages_query = db.query(Message).filter(Message.session_id == session.id)

        provider_usage = (
            db.query(
                Message.provider,
                func.count(Message.id).label("count")
            )
            .filter(Message.session_id == session.id)
            .group_by(Message.provider)
            .all()
        )

        return {
            "session_title": session.title,
            "total_messages": messages_query.count(),
            "user_messages": messages_query.filter(Message.role == "user").count(),
            "assistant_messages": messages_query.filter(Message.role == "assistant").count(),
            "system_messages": messages_query.filter(Message.role == "system").count(),
            "provider_usage": [
                {
                    "provider": provider,
                    "count": count
                }
                for provider, count in provider_usage
            ]
        }

    # func to get provider usage of the logged-in user (provider, count)
    @staticmethod
    def get_provider_usage(db, current_user):
        provider_usage = (
            db.query(
                Message.provider,
                func.count(Message.id).label("count")
            )
            .join(ChatSession)
            .filter(
                ChatSession.user_id == current_user.id,
                Message.provider.isnot(None)
            )
            .group_by(Message.provider)
            .order_by(func.count(Message.id).desc())
            .all()
        )

        return [
            {
                "provider": provider,
                "count": count
            }
            for provider, count in provider_usage
        ]


    # func to get daily activity of the logged-in user (date, messages) 
    @staticmethod
    def get_daily_activity(db, current_user):

        activity = (
            db.query(
                func.date(Message.created_at).label("date"),
                func.count(Message.id).label("messages")
            )
            .join(ChatSession)
            .filter(ChatSession.user_id == current_user.id)
            .group_by(func.date(Message.created_at))
            .order_by(func.date(Message.created_at))
            .all()
        )

        return [
            {
                "date": date,
                "messages": messages
            }
            for date, messages in activity
        ]     
    

    # func to get conversation statistics of the logged-in user
    @staticmethod
    def get_conversation_statistics(db, current_user):

        sessions_query = db.query(ChatSession).filter(
            ChatSession.user_id == current_user.id
        )

        total_sessions = sessions_query.count()

        session_counts = (
            db.query(
                ChatSession.id,
                func.count(Message.id).label("message_count")
            )
            .outerjoin(Message)
            .filter(ChatSession.user_id == current_user.id)
            .group_by(ChatSession.id)
            .all()
        )

        if not session_counts:
            return {
                "average_messages_per_session": 0,
                "longest_session": 0,
                "shortest_session": 0,
            }

        message_counts = [count for _, count in session_counts]

        return {
            "average_messages_per_session": (
                sum(message_counts) / total_sessions
                if total_sessions > 0 else 0
            ),
            "longest_session": max(message_counts),
            "shortest_session": min(message_counts),
        }
    
    # func to get recent activity of the logged-in user (last 10 sessions)
    @staticmethod
    def get_recent_activity(db, current_user, limit=10):

        recent_sessions = (
            db.query(ChatSession)
            .filter(ChatSession.user_id == current_user.id)
            .order_by(ChatSession.created_at.desc())
            .limit(limit)
            .all()
        )

        activity = []

        for session in recent_sessions:
            latest_provider = (
                db.query(Message.provider)
                .filter(
                    Message.session_id == session.id,
                    Message.provider.isnot(None)
                )
                .order_by(Message.created_at.desc())
                .first()
            )

        return [
            {
                "session_id": session.id,
                "session_title": session.title,
                "provider": latest_provider[0] if latest_provider else None,
                "created_at": session.created_at,
            }
            for session in recent_sessions
        ]