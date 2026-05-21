from google import genai
from dotenv import load_dotenv
import os

from orchestrator.analytics import start_timer, end_timer, estimate_tokens

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY") # Access the Gemini API key from environment variables.
)

def generate_gemini_response(history):

    start_time = start_timer() # Start timer to measure latency for Gemini API call.

    conversation_history = "" # Initialize the conversation history string.

    # gemini stores the history in a single string format
    for message in history:
        role = message["role"]
        content = message["content"]
        conversation_history += f"{role}: {content}\n" # Format the conversation history as a string to pass to the Gemini API.

    response = client.models.generate_content(
        model="gemini-2.5-flash", # Specify the Gemini model to use for generating content.     
        contents=conversation_history, # Pass the conversation history to the Gemini API for context-aware response generation.
    )

    response_text = response.text # Extract the generated text from the Gemini API response.

    # Calculate latency and token count for analytics
    latency = end_timer(start_time)
    token_count = estimate_tokens(response_text)
    if response_text is None:
        token_count = 0

    return {
        "provider": "Google Gemini",
        "response": response.text,
        "latency": f"{latency}s",
        "token_count": token_count,
        "status": "success"
    }