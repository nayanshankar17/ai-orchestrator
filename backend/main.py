# A virtual environment isolates your Python packages for THIS project only.
# Without it:
    # packages install globally
    # version conflicts happen
# With it:
    # clean project dependencies
    # professional setup

# pip install fastapi uvicorn httpx python-dotenv
    # fastapi: Backend framework
    # uvicorn: Runs your backend server
    # httpx: Used later to call AI APIs
    # python-dotenv: Loads secret API keys from .env

# JSON: Data is always sent as JavaScript Object Notation to the backend,
# so we need to define the structure of that data using
# Pydantic models (like PromptRequest).


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

# Import routers(auth, session, analytics, orchestrator ...)
from app.routers.auth_routes import router as auth_router
from app.routers.session_routes import router as session_router
from app.routers.analytics_routes import router as analytics_router
from routers.orchestrator_routes import router as orchestrator_router

# Load environment variables
load_dotenv()

#fastAPI application
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    #who can access thia backend
    allow_origins=[
        "http://localhost:5173", # local host
        "https://ai-orchestrator-murex.vercel.app" # vercel frontend
    ],

    allow_credentials=True, # allows fronted to send cookies, data etc.. useful in authentication and user login 
    allow_methods=["*"],
    allow_headers=["*"],
)

# HOME ROUTE
@app.get("/")
def home():

    return {
        "message": "AI Orchestrator Backend Running"
    }

# Register routers (auth, chat,..)
app.include_router(auth_router)
app.include_router(session_router)
app.include_router(analytics_router)
app.include_router(orchestrator_router)


# COMMAND TO RUN BACKEND:
# python -m uvicorn main:app --reload

# Backend control panel + testing dashboard: Swagger Docs
# http://127.0.0.1:8000/docs

# COMMANDS TO RUN ALEMBIC WHENEVER WE UPDATE ANY MODEL
# alembic revision --autogenerate -m "describe change"
# alembic upgrade head