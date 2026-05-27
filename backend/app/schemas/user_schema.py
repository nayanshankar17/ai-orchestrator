# THIS FILE IS USED TO VALIDATE INCOMING REQUESTS, ENSURE CORRECT DATA-TYPES (eg: name = 123, REJECTED) 

#basemodel used for current request validation
from pydantic import BaseModel

# Schema for user registration request
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

# Schea for login request
class UserLogin(BaseModel):
    email: str
    password: str