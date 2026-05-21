#Stores the user_propt as => prompt =(provider, response)
response_cache = {} #dictionary

#this func helps in fetching the response if generated earlier for similar task.
def get_cached_response(prompt, provider):
    key = f"{provider}:{prompt}"

    return response_cache.get(key)

#this func stores the prompt and the respective response in a key:value pair 
def cache_response(prompt, provider, response):
    key = f"{provider}:{prompt}"
    response_cache[key] = response
