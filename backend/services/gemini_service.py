from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY") # Access the Gemini API key from environment variables.
)

def generate_gemini_response(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash", # Specify the Gemini model to use for generating content.     
        contents=prompt, # Pass the user prompt to the Gemini API for content generation.
    )

    return response.text # Return the generated response text from the Gemini API.