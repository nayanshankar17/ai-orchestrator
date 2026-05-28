# THIS FILE IS USED TO VALIDATE INCOMING REQUESTS FOR USER_DATA, ENSURE CORRECT DATA-TYPES (eg: name = 123, REJECTED) 
# in this file datatypes are defined as per Python

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

