from services.gemini_service import generate_gemini_response
from services.groq_service import generate_groq_response


def execute_with_fallback(provider, history):

    try:
        if provider == "gemini":
            return generate_gemini_response(history)

        elif provider == "groq":
            return generate_groq_response(history)

    except Exception as e:
        print(f"Error occurred while executing {provider}: {e}")
        
        # bcoz API not working
        if provider == "operator": 
            return generate_gemini_response(history)
        
        # bcoz tokens expire often
        if provider == "gemini": 
            return generate_groq_response(history)
        
        return "An error occurred while processing your request."

        