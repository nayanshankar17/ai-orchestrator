from app.database.db import engine, Base
from app.models.user import User

# Create all tables in PostgreSQL, based on models inheriting from Base
# when this line runs SQLAlchemy converts your Python model into SQL.
Base.metadata.create_all(bind=engine)

print("Tables created successfully")
# command to test: python create_tables.py