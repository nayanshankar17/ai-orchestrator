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
from pydantic import BaseModel

from dotenv import load_dotenv

# ORCHESTRATOR
from orchestrator.orchestrate import run_orchestration

# Import authentication router
from app.routers.auth_routes import router as auth_router

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

# REQUEST MODEL
class PromptRequest(BaseModel):
    prompt: str
    # Multiple providers can be selected(if user selects only one provider, still the smart mode is not used then, we directly call the selected provider without routing logic)
    providers: list[str] = []


# HOME ROUTE
@app.get("/")
def home():

    return {
        "message": "AI Orchestrator Backend Running"
    }

# UNIFIED ORCHESTRATION ENDPOINT
@app.post("/orchestrate")

async def orchestrate(
    request: PromptRequest
):
    return await run_orchestration(
        request.prompt,
        request.providers
    )


# Register authentication router
app.include_router(auth_router)

# COMMAND TO RUN BACKEND:
# python -m uvicorn main:app --reload

# Backend control panel + testing dashboard:
# http://127.0.0.1:8000/docs