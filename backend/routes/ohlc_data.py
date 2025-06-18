from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db import get_db

router = APIRouter()

@router.get("/api/ohlc/{ticker}")
def get_ohlc_data(ticker: str, db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT date, open, high, low, close
        FROM ohlc_daily
        WHERE ticker = :ticker
        ORDER BY date ASC
    """), {"ticker": ticker}).fetchall()

    return [
        {"time": row[0].isoformat(), "open": row[1], "high": row[2], "low": row[3], "close": row[4]}
        for row in rows
    ]
