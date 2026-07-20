# Orchestrator
from orchestrator.router import choose_provider
from orchestrator.fallback import execute_with_fallback
from orchestrator.cache import get_cached_response, cache_response
from orchestrator.logger import log_info

# this is used to shift from sequential_execution(gemini -> groq ->...) to parallel_execution(gemini + groq +...)
import asyncio

# ASYNC PROVIDER WRAPPER
async def run_provider(provider, history, user=None):
    return execute_with_fallback(provider, history, user)


# MAIN ORCHESTRATION LOGIC
async def run_orchestration(user_prompt, selected_providers, user=None, history=None):

    log_info(f"New prompt received: {user_prompt}")
    
    if history is None:
        history = []
        
    history.append({
        "role": "user",
        "content": user_prompt
    })

    responses = [] # Store all provider responses

    # SMART MODE: If no providers selected, backend intelligently chooses one
    if len(selected_providers) == 0:
        provider = choose_provider(user_prompt, user) # router.py

        cached = get_cached_response(user_prompt, provider)
        if cached:
            return {
                "responses": [cached],
                "cached": True,
            }

        response = execute_with_fallback(provider, history, user) # fallback.py

        responses.append(response) # add the latest response to the responses list

        cache_response(user_prompt, provider, response) # update the cache.py dictionary

        history.append({
            "role": "assistant",
            "content": response["response"]
        })

    # MULTI PROVIDER MODE, ASYNC PROVIDER WRAPPER is used here (async def run_provider): parallel execution
    else:

        tasks = [
            run_provider(provider, history, user) # parallel execution
            for provider in selected_providers
        ]

        # asyncio.gather(): tells python to run ALL tasks simultaneously
        # tasks stores the prompts in a list(packed data: [a,b,c..]), *tasks unpacks it: a,b,c.. gather() accepts only unpacked data
        # await: pause here until all async tasks complete
        results = await asyncio.gather(
            *tasks,
            return_exceptions=True
        )

        for result in results:
            if isinstance(result, Exception): # if any provider fails, we catch the exception and return a generic error response for that provider
                print("GROQ EXCEPTION:", repr(result))
                raise result
            else:
                responses.append(result)
                history.append({
                    "role": "assistant",
                    "content": result["response"]
                })

    # Return all responses and session history
    return {
        "responses": responses,
        "history": history
    }