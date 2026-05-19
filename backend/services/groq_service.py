from groq import Groq
from dotenv import load_dotenv
import os   

from orchestrator.analytics import start_timer, end_timer, estimate_tokens

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY") # Access the Groq API key from environment variables.
)

def generate_groq_response(history):

    start_time = start_timer() # Start timer to measure latency for Groq API call.

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",

        messages=history, # Pass the conversation history to the Groq API for context-aware response generation.
    )

    # Groq works in openAI format, so we can maintain the convesrsation history in form of array
    # of messages with role and content
    response_text = response.choices[0].message.content # Extract the generated text from the Groq API response.

    # Calculate latency and token count for analytics
    latency = end_timer(start_time)
    tokens = estimate_tokens(response_text)
    if response_text is None:
        token_count = 0

    return {
        "provider": "Groq",
        "response": response.choices[0].message.content,
        "latency": f"{latency}s",
        "token_count": tokens,
        "status": "success"
    }