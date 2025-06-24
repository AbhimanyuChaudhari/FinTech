from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Internal imports
from routes import sector_map, ohlc_data
from routes import financial_analysis
from routes import sentiment_analysis
from routes import technical_analysis
from routes import risk_analysis
from routes import watchlist
from routes import metadata_search
from routes import ohlc_route
from models import Base
from db import engine

# Initialize tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI()

# CORS setup — allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(sector_map.router)     # /api/sectors
app.include_router(ohlc_data.router)      # /api/ohlc/{ticker}
app.include_router(financial_analysis.router)
app.include_router(sentiment_analysis.router)
app.include_router(technical_analysis.router)
app.include_router(risk_analysis.router)
app.include_router(watchlist.router)
app.include_router(metadata_search.router)
app.include_router(ohlc_route.router, prefix="/api")
