from services.gemini_service import generate_gemini_response
from services.groq_service import generate_groq_response
from orchestrator.logger import (
    log_info,
    log_error,
    log_warning
)


def execute_with_fallback(provider, history):

    try:
        log_info(f"Executing provider: {provider}")
        if provider == "gemini":
            return generate_gemini_response(history)

        elif provider == "groq":
            return generate_groq_response(history)

    except Exception as e:
        log_error(f"{provider} failed: {e}")
        
        # bcoz tokens expire often
        if provider == "gemini": 
            log_warning("Gemini failed. Switching to Groq fallback.")
            return generate_groq_response(history)
        
        return {
            "provider": provider,
            "response": "Provider unavailable. Please try again later.",
            "latency": "--",
            "token_count": 0,
            "status": "error"
        }

        