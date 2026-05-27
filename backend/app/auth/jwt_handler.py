#THIS FILE WORKS ON ONLY TOKEN-RELATED LOGIC: JWT CREATION, DECODING, EXPIREY, EVRIFICATION

#used for creating token expirey time
from datetime import datetime, timedelta

#used for encoding and decoding JWT (JSON Web Token) tokens 
from jose import jwt 

#Secret key used to sign in jwt tokens, never expose this
SECRET_KEY = "special_key_one"

# Algorithm used for token signing
ALGORITHM = "HS256"

#token expirey time 
JWT_TOKEN_EXPIREY_TIME = 30

#func to generate jwt_token
def create_access_token (data: dict): #data contains details such as email, name etc

    to_encode = data.copy() #copy incoming data, prevents modifying incoming data

    expire = datetime.utcnow() + timedelta(minutes=JWT_TOKEN_EXPIREY_TIME) #calculating expirery of token (eg: 14:12 + 30minutes)

    to_encode.update({"exp": expire}) # Add expiry inside token

    encoded_jwt = jwt.encode(
        to_encode, #encoded data
        SECRET_KEY, #special access key
        algorithm=ALGORITHM, #algo used for token generation
    )

    return encoded_jwt

#expirey is needed because if token is leaked it would work forever which is a huge security threat, that is wht expirey is added to tokens
