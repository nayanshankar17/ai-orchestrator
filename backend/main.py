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
#JSON: Data is always sent as JavaScript Object Notation to the backend, so we need to define the structure of that data using Pydantic models (like PromptRequest).



from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv  # Loads environment variables from a .env file into your application, allowing you to keep sensitive information like API keys out of your codebase.
import os # To access environment variables (like API keys) from the .env file.


from services.gemini_service import generate_gemini_response #gemini
from services.groq_service import generate_groq_response #groq
from services.openrouter_service import generate_openrouter_response #openrouter

# Load environment variables
load_dotenv()
print(os.getenv("GEMINI_API_KEY"))
print(os.getenv("GROQ_API_KEY"))
print(os.getenv("OPENROUTER_API_KEY"))

app = FastAPI() #Creates your backend app/server.

# Allow React frontend to access backend
app.add_middleware(
    CORSMiddleware, #Cross-Origin Resource Sharing

    allow_origins=[
        "http://localhost:5173", #here we specify the URL of our React frontend, allowing it to make requests to our FastAPI backend.
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

class PromptRequest(BaseModel): #Defines the structure of incoming JSON data.
    prompt: str

@app.get("/")  #Defines a route for the homepage, It tells FastAPI: “When someone visits /, run the function below.”
def home():
    return{
        "message": "backend running successfully"
    }

@app.post("/generate-gemini")
def generate(request: PromptRequest):   #Extracts the prompt text from incoming JSON.

    try:

        # This is where you will call your AI API to generate a response based on the prompt.
        user_prompt = request.prompt # Extract the prompt text from the request object.

        response = generate_gemini_response(user_prompt) # Call the function to generate a response using the Gemini API.

        return {
            "response": response
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }
    
@app.post("/generate-groq")
def generate_groq(request: PromptRequest):

    try:

        user_prompt = request.prompt

        response = generate_groq_response(user_prompt)

        return {
            "response": response
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }

@app.post("/generate-openrouter")
def generate_openrouter(request: PromptRequest):

    try:

        user_prompt = request.prompt

        response = generate_openrouter_response(user_prompt)

        return {
            "response": response
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }

# COMMAND TO RUN BACKEND: python -m uvicorn main:app --reload
# Backend control panel + testing dashboard:  http://127.0.0.1:8000/docs