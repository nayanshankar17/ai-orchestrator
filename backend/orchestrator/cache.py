# CACHE IS USED TO AVOID RECOMPUTATION OF PROMPTS, (eg: prompt: hi, if user sends the same prompt again, the app will check the cache
# and will find the same prompt recently executed, as a result it will return the same response instead of executing the prompt again, this 
# reduces execution time and the number of tokens used)

from orchestrator.logger import log_info

import time
CACHE_EXPIRY = 300 # cache expires after 5 minutes

#Stores the user_propt as => prompt =(provider, response)
response_cache = {} #dictionary

#this func helps in fetching the response if generated earlier for similar task.
def get_cached_response(prompt, provider):
    key = f"{provider}:{prompt}"

    cached_data = response_cache.get(key)
    current_time = time.time()

    # if the cache is empty
    if cached_data is None:
        log_info(f"Cache MISS for {provider}")
        return None
    
    # check cache expiry
    if(current_time - cached_data["timestamp"] > CACHE_EXPIRY):
        del response_cache[key]
        log_info(f"Cache MISS for {provider}")
        return None

    log_info(f"Cache HIT for {provider}")
    return cached_data["response"]

def cache_cleanup():
    current_time = time.time()
    expired_keys = [] # list to store the keys that are expired

    #finding expired keys
    for key,value in response_cache.items():
        if(current_time - value["timestamp"] > CACHE_EXPIRY):
            expired_keys.append(key)
    # deleting expired keys
    for key in expired_keys:
        del response_cache[key]
        if len(expired_keys) > 0:
            log_info(f"Removed {len(expired_keys)} expired cache entries")

        

#this func stores the prompt and the respective response and provider, in a key:value pair 
def cache_response(prompt, provider, response):
    
    cache_cleanup() # call cache_cleanup() function evreytime a new key:value pair is added

    key = f"{provider}:{prompt}"
    response_cache[key] = {
        "response": response, #store reponse
        "timestamp": time.time(), # store creation time
    }
    log_info(f"Response cached for {provider}")
