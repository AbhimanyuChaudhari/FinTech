from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import sector_map, ohlc_data  # ✅ Import both
from backend.models import Base
from backend.db import engine
from backend.routes import financial_analysis
from backend.routes import sentiment_analysis  
from backend.routes import technical_analysis
from backend.routes import risk_analysis
from backend.routes import watchlist
from backend.routes import metadata_search
from backend.routes import ohlc_route
from backend.routes import options
from backend.routes import hedge

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
app.include_router(options.router, prefix="/api/options", tags=["Options"])
app.include_router(hedge.router, prefix="/api")
