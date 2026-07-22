from groq import Groq
from dotenv import load_dotenv
import os   

from orchestrator.analytics import start_timer, end_timer, estimate_tokens
from orchestrator.logger import log_info

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY") # Access the Groq API key from environment variables.
)

def generate_groq_response(history, user=None):

    log_info("Sending request to Groq")

    start_time = start_timer() # Start timer to measure latency for Groq API call.

    # Default parameters
    model = "llama-3.3-70b-versatile"
    temperature = 0.7
    max_tokens = 400

    if user and user.preferences:
        print("Preferred Provider:", user.preferences.preferred_provider)
        print("Preferred Model:", user.preferences.preferred_model)

        temperature = user.preferences.temperature
        max_tokens = user.preferences.max_tokens
        if user.preferences.preferred_provider == "groq" and user.preferences.preferred_model:
            model = user.preferences.preferred_model

    response = client.chat.completions.create(
        model=model,

        messages= [
                    {
                        "role": "system",
                        # context to maintain verbosity
                        "content": """
                            Give concise and brief answers.
                            Do NOT provide long explanations unless
                            the user explicitly asks for:
                            - detailed explanations
                            - step-by-step solutions
                            - deep analysis
                            - extensive notes
                            Keep responses short and efficient by default. """
            }
        ] + history, # Pass the conversation history to the Groq API for context-aware response generation

        temperature=temperature,
        max_tokens=max_tokens, # for token optimization.
    )

    # Groq works in openAI format, so we can maintain the convesrsation history in form of array
    # of messages with role and content
    response_text = response.choices[0].message.content # Extract the generated text from the Groq API response.

    # Calculate latency and token count for analytics
    latency = end_timer(start_time)
    token_count = estimate_tokens(response_text)
    if response_text is None:
        token_count = 0
    
    return {
        "provider": "Groq",
        "response": response.choices[0].message.content,
        "latency": f"{latency}s",
        "token_count": token_count,
        "status": "success"
    }