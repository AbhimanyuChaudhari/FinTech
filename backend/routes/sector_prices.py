# routes/sector_map.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db import get_db

router = APIRouter()

@router.get("/api/sectors")
def get_sectors(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT ticker, name, exchange, industry, sector, market_cap, is_etf
            FROM ticker_metadata
            WHERE sector IS NOT NULL
        """)
    ).mappings().fetchall()

    result = {}
    for row in rows:
        sector = row["sector"]
        if sector not in result:
            result[sector] = []
        result[sector].append({
            "ticker": row["ticker"],
            "name": row["name"],
            "exchange": row["exchange"],
            "industry": row["industry"],
            "market_cap": row["market_cap"],
            "is_etf": row["is_etf"]
        })

    return result
