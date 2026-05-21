import requests
from dotenv import load_dotenv
import os

from orchestrator.analytics import (
    start_timer,
    end_timer,
    estimate_tokens
)

load_dotenv()


def generate_huggingface_response(
    history
):

    # Start timer to measure latency
    start_time = start_timer()

    # Extract latest user message
    prompt = history[-1]["content"]

    response = requests.post(

        url="https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct",,

        headers={

            "Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}",

            "Content-Type": "application/json",
        },

        json={

            "inputs": prompt,

            "parameters": {

                "max_new_tokens": 300,

                "temperature": 0.7,

                "return_full_text": False
            }
        }
    )

    data = response.json()
    print(response.status_code)

    print(data)

    # Handle API/model errors
    if isinstance(data, dict) and "error" in data:

        return {

            "provider": "Hugging Face",

            "response": str(data["error"]),

            "latency": "--",

            "token_count": 0,

            "status": "error"
        }

    # Hugging Face usually returns list format
    response_text = data[0]["generated_text"]

    # Calculate latency and token count
    latency = end_timer(start_time)

    token_count = estimate_tokens(
        response_text
    )

    if response_text is None:
        token_count = 0

    return {

        "provider": "Hugging Face",

        "response": response_text,

        "latency": f"{latency}s",

        "token_count": token_count,

        "status": "success"
    }