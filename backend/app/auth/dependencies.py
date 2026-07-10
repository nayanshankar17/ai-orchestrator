# USED TO EXTRACT THE DETAILS OF CURRENT LOGGED_IN USER

# Used for dependency injection
from fastapi import Depends, HTTPException 

# Helps extract Bearer token from Authorization header
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError,jwt
from sqlalchemy.orm import Session

# Import database query function
from sqlalchemy.future import select

from app.database.db import get_db # import func to access DB
from app.models.user import User # import User model
from app.auth.jwt_handler import SECRET_KEY, ALGORITHM

# This tells FastAPI where login endpoint exists
outh2_scheme = OAuth2PasswordBearer(
    tokenUrl = "auth/login" #Login Route
)

# Extracts currently logged in user
def get_current_user(
        token: str = Depends(outh2_scheme), # Automatically extract token from request
        db: Session = Depends(get_db) # Inject database session
):
    try:
        # payload is the data section inside a JWT token that stores user-related information like user ID and expiry time.
        payload = jwt.decode(
            token,
            SECRET_KEY, #security key used during encoding
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub") #extract user_id from payload

        # If token has no user ID
        if user_id is None:
            return None
        

    # Handle invalid JWT tokens
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
        return None
    
    # query database for user
    statement = select(User).where(User.id == user_id)

    # execute query: Send the SQL query to PostgreSQL and get the result back. 
    result = db.execute(statement)

    # Extract actual User object
    user = result.scalar_one_or_none()

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    return user