# engine is responsable for connecting postgreSQL and python
from sqlalchemy import create_engine

# sessionmaker helps create database sessions, sessions are used to talk to the database
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv
import os
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# creating connection engine, this is the main bridge between app and the database
engine = create_engine(DATABASE_URL)

# Create session factory, every database operation uses a session
# A session is like a temporary conversation with the database.
SessionLocal =  sessionmaker(
    # autocommit=False means: changes are NOT automatically saved, we manually commit when needed
    autocommit=False,

    # autoflush=False means: SQLAlchemy won't automatically push changes instantly
    autoflush=False,

    # bind engine to session, connects session to PostgreSQL
    bind=engine
)

# base class for all models, every table will inherit from this
Base = declarative_base()

# Dependency function for FastAPI
# Provides database session to routes
def get_db():

    # Create database session
    db = SessionLocal()

    try:

        # Give session to route
        yield db

    finally:

        # Always close session after request
        db.close()