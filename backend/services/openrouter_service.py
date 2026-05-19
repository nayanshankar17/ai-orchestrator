import requests
from dotenv import load_dotenv
import os

from orchestrator.analytics import start_timer, end_timer, estimate_tokens

load_dotenv()

def generate_openrouter_response(prompt):

    response = requests.post(

        url="https://openrouter.ai/api/v1/chat/completions",

        headers={

            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",

            "Content-Type": "application/json",
        },

        json={

            "model": "meta-llama/llama-3-8b-instruct:free",

            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
    )

    data = response.json()

    print(data)

    if "choices" not in data:
        return str(data)

    return data["choices"][0]["message"]["content"]