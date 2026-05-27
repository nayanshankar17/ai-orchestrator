# THIS FILE WORKS ON PASSWORDS: HASHING, VERIFICATION

# This handles password hashing algorithms safely, handles hashing, verification and algo upgrades
from passlib.context import CryptContext

pwd_context = CryptContext (
    schemes=["bcrypt"], # algo used for hasing
    deprecated="auto", # automatically handle older hashes if algorithm changes later
)

#func to convert plain pass to hashed pass
def hash_password(password: str):
    return pwd_context.hash(password)

#func to verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password) #return True if password matches