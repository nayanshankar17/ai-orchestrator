from google import genai
from dotenv import load_dotenv
import os

from orchestrator.logger import log_info

from orchestrator.analytics import start_timer, end_timer, estimate_tokens

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY") # Access the Gemini API key from environment variables.
)

def generate_gemini_response(history, user=None):

    log_info("Sending request to Gemini")

    start_time = start_timer() # Start timer to measure latency for Gemini API call.

    system_instruction = """
        Give concise and brief answers.
        Do NOT provide long explanations unless
        the user explicitly asks for:
        - detailed explanations
        - step-by-step solutions
        - deep analysis
        - extensive notes
        Keep responses short and efficient by default.
    """

    conversation_history = (
        system_instruction + "\n\n"
    ) # Initialize the conversation history string.

    # gemini stores the history in a single string format
    for message in history:
        role = message["role"]
        content = message["content"]
        conversation_history += f"{role}: {content}\n" # Format the conversation history as a string to pass to the Gemini API.

    # Default parameters
    model = "gemini-2.5-flash"
    temperature = 0.5
    max_tokens = 700

    if user and user.preferences:
        temperature = user.preferences.temperature
        max_tokens = user.preferences.max_tokens
        if user.preferences.preferred_provider == "gemini" and user.preferences.preferred_model:
            model = user.preferences.preferred_model

    response = client.models.generate_content(
        model=model, # Specify the Gemini model to use for generating content.     
        contents=conversation_history, # Pass the conversation history to the Gemini API for context-aware response generation.
        config={
            "max_output_tokens": max_tokens, # for token optimization (mapped dynamically from preferences)
            "temperature": temperature, # this controls the nature of response (mapped dynamically from preferences)
        }
    )

    response_text = response.text # Extract the generated text from the Gemini API response.

    # Calculate latency and token count for analytics
    latency = end_timer(start_time)
    token_count = estimate_tokens(response_text)
    if response_text is None:
        token_count = 0

    return {
        "provider": "Google Gemini",
        "response": response_text,
        "latency": f"{latency}s",
        "token_count": token_count,
        "status": "success"
    }