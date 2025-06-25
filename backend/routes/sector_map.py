# routes/sector_map.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db import get_db
<<<<<<< HEAD
=======

>>>>>>> a701f2c4e9aaf0053d4265175c1f1947e2267647


router = APIRouter()

@router.get("/api/sectors")
def get_sectors(db: Session = Depends(get_db)):
    query = text("SELECT ticker, name, sector, exchange FROM ticker_metadata WHERE sector IS NOT NULL")
    rows = db.execute(query).fetchall()

    sector_map = {}
    for row in rows:
        sector = row[2] or "Uncategorized"
        if sector not in sector_map:
            sector_map[sector] = []
        sector_map[sector].append({
            "ticker": row[0],
            "name": row[1],
            "exchange": row[3]
        })

    return sector_map
