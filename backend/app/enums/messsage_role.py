# What Happens Now?
# Swagger will automatically show:
# role
#  ├── user
#  ├── assistant
#  └── system
# instead of:
# role: string

# Enums(Enumeration) restrict a field to a predefined set of values.
# They improve validation, prevent invalid data from entering the database, and eliminate bugs caused by inconsistent string values.

from enum import Enum

class MessageRole(str, Enum):
    USER= "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"