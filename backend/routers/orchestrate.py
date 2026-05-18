from fastapi import APIRouter
from pydantic import BaseModel

import time

from orchestrator.router import choose_provider
from orchestrator.fallback import execute_with_fallback

router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str
    providers: list[str] = []

@router.post("/orchestrate")
def orchestrate(request: PromptRequest):
    try:

        user_prompt = request.prompt
        selected_providers = request.providers # List of providers selected by user for comparison mode
        responses = []

        # SMART MODE or no provider selected by user, we use the router to decide the best provider based on the prompt content.
        if len(selected_providers) == 0:

            start_time = time.time()

            provider = choose_provider(user_prompt) # Router decides the best provider based on the prompt content

            response = execute_with_fallback(
                provider,
                user_prompt
            )

            latency = round(
                time.time() - start_time,
                2
            )

            responses.append({

                "provider": provider,

                "response": response,

                "status": "success",

                "latency": f"{latency}s"
            })

        # COMPARISON MODE: User selected providers manually
        else:

            for provider in selected_providers:

                try:

                    start_time = time.time()

                    response = execute_with_fallback(
                        provider,
                        user_prompt
                    )

                    latency = round(
                        time.time() - start_time,
                        2
                    )

                    responses.append({

                        "provider": provider,

                        "response": response,

                        "status": "success",

                        "latency": f"{latency}s"
                    })

                except Exception as e:

                    responses.append({

                        "provider": provider,

                        "response": str(e),

                        "status": "error",

                        "latency": "--"
                    })

        return {
            "responses": responses
        }

    except Exception as e:

        print(e)

        return {
            "error": str(e)
        }