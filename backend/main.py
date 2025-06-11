from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sector_map
from models import Base
from db import engine

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to localhost:5173 in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(sector_map.router)
