from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db import get_db


router = APIRouter()

@router.get("/api/ohlc")
def get_ohlc_data(ticker: str, interval: str = "1d", db: Session = Depends(get_db)):
    # Only support daily OHLC for now, fallback for any interval
    if interval != "1d":
        return []

    rows = db.execute(text("""
        SELECT date, open, high, low, close
        FROM ohlc_daily
        WHERE ticker = :ticker
        ORDER BY date ASC
    """), {"ticker": ticker}).fetchall()

    return [
        {"Date": row[0].isoformat(), "Open": row[1], "High": row[2], "Low": row[3], "Close": row[4]}
        for row in rows
    ]
