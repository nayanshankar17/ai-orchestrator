#Orchestrator
from orchestrator.router import choose_provider
from orchestrator.fallback import execute_with_fallback
from orchestrator.memory import add_message, get_history
from orchestrator.cache import get_cached_response,cache_response

#this is used to shift from sequesntial_execution(gemini -> groq ->...) to parallel_ execution(gemini + groq +...)
import asyncio

# ASYNC PROVIDER WRAPPER
async def run_provider(provider,history):
    return execute_with_fallback(provider,history)


# MAIN ORCHESTRATION LOGIC
async def run_orchestration(user_prompt,selected_providers):
    
    add_message("user",user_prompt) #maintains the history in memomry.py

    responses = [] # Store all provider responses


    # SMART MODE: If no providers selected, backend intelligently chooses one
    if len(selected_providers) == 0:
        provider = choose_provider(user_prompt) #router.py

        cached = get_cached_response(user_prompt, provider)
        if cached:
            print("CACHE HIT") # To check if cache is working properly or not
            return {
                "responses": [cached],
                "cached": True,
            }

        response = execute_with_fallback(provider,get_history()) #fallback.py

        responses.append(response) #add the latest response to the responses list

        cache_response(user_prompt,provider, response) #update the cache.py dictionary

        add_message("assistant", response["response"]) # update the memory.py list for maintaining the conversation

    # MULTI PROVIDER MODE, ASYNC PROVIDER WRAPPER is used here (async def run_provider): parallel execution
    else:

        tasks = [

            run_provider(provider,get_history()) #parallel execution

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

            if isinstance(result,Exception):

                responses.append({
                    "provider": "unknown",
                    "latency": "--",
                    "response": str(result),
                    "status": "error",
                })

            else:

                responses.append(result)
                add_message("assistant",result["response"])
    # Return all responses
    return {
        "responses": responses,
        "history": get_history()
    }