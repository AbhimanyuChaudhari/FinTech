from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import sector_map, ohlc_data  # ✅ Import both
from backend.models import Base
from backend.db import engine
from backend.routes import financial_analysis
 
# Initialize tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI()

# CORS setup — allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔁 Replace with specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(sector_map.router)     # /api/sectors
app.include_router(ohlc_data.router)      # /api/ohlc/{ticker}
app.include_router(financial_analysis.router)


