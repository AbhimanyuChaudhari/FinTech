import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use standard DATABASE_URL environment variable
DATABASE_URL = "postgresql://neondb_owner:npg_qT5G9dlrFbUN@ep-sweet-glade-a8q34pzt-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
