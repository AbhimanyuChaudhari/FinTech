from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from backend.models import TickerMetadata
from backend.db import get_db

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("/")  # ✅ trailing slash required
def search_tickers(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = db.query(TickerMetadata).filter(
        TickerMetadata.name.ilike(f"%{query}%") |
        TickerMetadata.ticker.ilike(f"%{query}%")
    ).limit(10).all()

    return [{
        "ticker": r.ticker,
        "name": r.name,
        "sector": r.sector
    } for r in results]
