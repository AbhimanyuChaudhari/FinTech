from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sector_map, ohlc_data
models import Base
db import engine
routes import financial_analysis
routes import sentiment_analysis  
routes import technical_analysis
routes import risk_analysis
routes import watchlist
routes import metadata_search
routes import ohlc_route
 
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