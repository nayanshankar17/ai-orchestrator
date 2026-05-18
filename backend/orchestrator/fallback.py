from services.gemini_service import generate_gemini_response
from services.groq_service import generate_groq_response
from services.openrouter_service import generate_openrouter_response

def execute_with_fallback(provider, prompt):

    try:
        if provider == "gemini":
            return generate_gemini_response(prompt)

        elif provider == "groq":
            return generate_groq_response(prompt)

        elif provider == "openrouter":
            return generate_openrouter_response(prompt)
    
    except Exception as e:
        print(f"Error occurred while executing {provider}: {e}")
        
        # bcoz API not working
        if provider == "operator": 
            return generate_gemini_response(prompt)
        
        # bcoz tokens expire often
        if provider == "gemini": 
            return generate_groq_response(prompt)
        
        return "An error occurred while processing your request."