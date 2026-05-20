response_cache = {} #dictionary

#this func helps in fetching the response if generated earlier for similar task.
def get_cached_response(prompt):
    return response_cache.get(prompt)

#this func stores the prompt and the respective response in a key:value pair 
def cache_response(prompt, response):
    response_cache[prompt] = response
