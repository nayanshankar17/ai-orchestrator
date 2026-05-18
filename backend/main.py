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
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import os
import time

# SERVICES
from services.gemini_service import generate_gemini_response
from services.groq_service import generate_groq_response
from services.openrouter_service import generate_openrouter_response

# ORCHESTRATOR
from orchestrator.router import choose_provider
from orchestrator.fallback import execute_with_fallback

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
    ],

    allow_credentials=True,
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
def orchestrate(request: PromptRequest):

    try:

        user_prompt = request.prompt

        # Get selected providers from frontend (for comparison mode)
        selected_providers = request.providers

        responses = [] # Store all provider responses


        # SMART MODE
        # If no providers selected,
        # backend intelligently chooses one
        if len(selected_providers) == 0:

            # START TIMER
            start_time = time.time()

            # Choose best provider automatically
            provider = choose_provider(user_prompt)

            # EXECUTE WITH FALLBACK
            response = execute_with_fallback(
                provider,
                user_prompt
            )

            # CALCULATE LATENCY
            latency = round(time.time() - start_time, 2)

            # Add response to responses list
            responses.append({

                "provider": provider,

                "latency": f"{latency}s",

                "response": response,

                "status": "success"
            })

        # Run multiple selected providers in parallel and return all responses
        else:

            for provider in selected_providers:

                try:

                    # START TIMER
                    start_time = time.time()

                    # EXECUTE WITH FALLBACK
                    response = execute_with_fallback(provider,user_prompt)

                    # CALCULATE LATENCY
                    latency = round(time.time() - start_time,2)

                    # Store each provider response
                    responses.append({

                        "provider": provider,

                        "latency": f"{latency}s",

                        "response": response,

                        "status": "success"
                    })

                except Exception as e:

                    # Handle provider-specific failure
                    responses.append({

                        "provider": provider,

                        "latency": "--",

                        "response": str(e),

                        "status": "error"
                    })

        # Return all responses
        return {
            "responses": responses
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }


# COMMAND TO RUN BACKEND:
# python -m uvicorn main:app --reload

# Backend control panel + testing dashboard:
# http://127.0.0.1:8000/docs