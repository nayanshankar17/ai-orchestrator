# THIS FILE IS USED TO IDENTIFY USERS SECURELY, this file acts as main.py for authentication part of the app

# APIRouter helps organize authentication routes
# Depends is used for dependency injection
# Used for raising API errors
from fastapi import APIRouter, Depends, HTTPException

# SQLAlchemy database session type
from sqlalchemy.orm import Session

# Import database session dependency
from app.database.db import get_db

# Import User SQLalchemy model
from app.models.user import User

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.schemas.user_schema import UserCreate, UserLogin

#create authenticatio router
router = APIRouter(
    prefix="/auth", # All auth routes start with /auth, prefix are addded to for cleaner APIs, for (eg: /chat/.. , /auth/.. ..etc)
    tags=["Authentication"], # Group name in Swagger UI
)


# USER REGISTRATION ROUTES
@router.post("/register")
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
    db.commit() # save new_user permanently
    db.refresh(new_user) # refresh object from database
    return{
        "message": "user registered successfully."
    } 
        
#USER LOGIN ROUTE
@router.post("/login")
def login_user(
    user: UserLogin, # Incoming login request body
    db: Session = Depends(get_db) # Inject database session
):
    # Find user using email
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    #if the user_email doesnt exist
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )
    
    #verify entered password
    valid_password = verify_password(user.password, db_user.password_hash)

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