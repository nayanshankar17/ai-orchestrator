#used to filter the prompt and decide which provider to use based on the content of the prompt. 
#For example, if the prompt contains coding-related keywords, we can route it to Groq, while if 
#it contains creative writing keywords, we can route it to Gemini.

def choose_provider(prompt: str, user=None):

    prompt = prompt.lower()

    coding_keywords = [
        "code",
        "python",
        "java",
        "bug",
        "algorithm",
        "function"
    ]

    creative_keywords = [
        "story",
        "poem",
        "creative",
        "lyrics"
    ]

    if any(word in prompt for word in coding_keywords):
        return "groq"

    elif any(word in prompt for word in creative_keywords):
        return "gemini"

    if user and user.preferences and user.preferences.preferred_provider:
        return user.preferences.preferred_provider

    return "groq" # default provider