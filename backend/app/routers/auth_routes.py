# THIS FILE IS USED TO IDENTIFY USERS SECURELY, this file acts as main.py for authentication part of the app

# we did not create separate service and repository layers for authentication, as the logic is quite simple and straightforward, and can 
# be handled directly in the router. The authentication mainly involves user registration, login, and fetching the current user, which are 
# basic operations that can be efficiently managed within the router itself without the need for additional abstraction layers. This approach 
# helps to keep the codebase simpler and more maintainable, while still adhering to good design principles. However, if the authentication
# logic becomes more complex in the future, we can always refactor it into separate service and repository layers as needed.

# APIRouter helps organize authentication routes
# Depends is used for dependency injection
# HTTPException is used for raising API errors
from fastapi import APIRouter, Depends, HTTPException

from fastapi.security import OAuth2PasswordRequestForm

# SQLAlchemy database session type
from sqlalchemy.orm import Session

from sqlalchemy.future import select

# Import database session dependency
from app.database.db import get_db

# Import User SQLalchemy model
from app.models.user import User

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.schemas.user_schema import UserCreate, UserLogin
from app.auth.dependencies import get_current_user
from app.models.user_preference import UserPreferences

#create authentication router, later used to identify login endpoints in dependencies.py (eg: /auth/login.. )
router = APIRouter(
    prefix="/auth", # All auth routes start with /auth, prefix are addded to for cleuvicorn main:app --reloadaner APIs, for (eg: /chat/.. , /auth/.. ..etc)
    tags=["Authentication"], # Group name in Swagger UI
)


# USER REGISTRATION ROUTE
@router.post("/register") # POST /auth/register
def register_user(
    user: UserCreate, # Incoming request body
    db: Session = Depends(get_db) # Inject database session
):
    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    # if email already exists, prevent duplicate registrations from same email_ID
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    #create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user) #add new_user object to database session
    db.flush()  # Flush sends the INSERT to PostgreSQL without committing. This generates the UUID so we can use it immediately.
    
    # Create default user preferences for the new user
    new_preferences = UserPreferences(
        user_id=new_user.id
    )
    db.add(new_preferences) # add new_preferences object to database session

    db.commit() # save new_user with its preferences permanently
    db.refresh(new_user) # refresh object from database
    db.refresh(new_preferences)

    return{
        "message": "user registered successfully."
    } 
        
#USER LOGIN ROUTE
@router.post("/login") # POST /auth/login
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), # Automatically extracts username/password
    db: Session = Depends(get_db) # Inject database session
):
    # Find user using email
    statement = select(User).where(User.email == form_data.username) # We are treating username as email

    # Execute query
    result = db.execute(statement)


    # Extract User object
    db_user = result.scalar_one_or_none()

    #if the user_email doesnt exist
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )
    
    #verify entered password
    valid_password = verify_password(form_data.password, db_user.password_hash)

    # if entered password is wrong
    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )
    
    # if all entered credentails are correct, generate JWT token
    access_token = create_access_token(
        data={
            "sub": str(db_user.id)
        }
    )

    return{
        "access_token": access_token, # Generated JWT token
        "token_type": "bearer" # Authentication type, bearer: whoever BEARS (holds) the token gets access
    }

#PROTECTED ROUTE
# Returns currently authenticated user
@router.get("/me")
def get_me(
    # Extract JWT token -> Decode token -> Find user in database -> Inject user into route
    current_user: User = Depends(get_current_user),
):  
    if current_user is None:
        return{
            "message": "Invalid Authenticaton"
        }
    
    return{
        "id": str(current_user.id), # convert UUID to string
        "name": current_user.name,
        "email": current_user.email,
    }