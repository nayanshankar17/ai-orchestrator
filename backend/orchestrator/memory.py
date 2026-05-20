# This module manages the conversation history in memory for the session.
conversation_history = [] #List

#stores user message and assistant's response in memory for the session
def add_message(role, content):
    conversation_history.append({
        "role": role,
        "content": content
    })

#returns the conversation history for the session
def get_history():
    return conversation_history

#clears the conversation history for the session
def clear_history():
    conversation_history.clear()