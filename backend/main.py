from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

print("CWD:", os.getcwd())
print("FILES:", os.listdir())

from backend.db import engine
from backend.models import Base

# Import all route modules
from backend.routes import (
    sector_map,
    ohlc_data,
    financial_analysis,
    sentiment_analysis,
    technical_analysis,
    risk_analysis,
    watchlist,
    metadata_search,
    ohlc_route,
    options,
    hedge,
    hedge_route,
    autoregressive_m,
    MovingAverage_m,
    ARMA_m,
    ARIMA_m,
    SARIMA_m,
    ARIMAX_m,
    VAR_m,
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI()

# CORS middleware
origins = [
    "https://fin-tech-nine.vercel.app",  # ✅ production frontend
    "http://localhost:5173",             # ✅ local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,               # ← whitelist these origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with appropriate prefixes
app.include_router(sector_map.router, prefix="/api")
app.include_router(ohlc_data.router, prefix="/api")
app.include_router(financial_analysis.router, prefix="/api")
app.include_router(sentiment_analysis.router, prefix="/api")
app.include_router(technical_analysis.router, prefix="/api")
app.include_router(risk_analysis.router, prefix="/api")
app.include_router(metadata_search.router, prefix="/api")   # 👈 remove duplicate
app.include_router(ohlc_route.router, prefix="/api")
app.include_router(options.router, prefix="/api/options", tags=["Options"])
app.include_router(hedge.router, prefix="/api")
app.include_router(hedge_route.router, prefix="/api")
app.include_router(autoregressive_m.router, prefix="/api")
app.include_router(MovingAverage_m.router, prefix="/api")
app.include_router(ARMA_m.router, prefix="/api")
app.include_router(ARIMA_m.router, prefix="/api")
app.include_router(SARIMA_m.router, prefix="/api")
app.include_router(ARIMAX_m.router, prefix="/api")
app.include_router(VAR_m.router, prefix="/api")
