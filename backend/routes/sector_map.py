from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import TickerMetadata
from db import get_db

router = APIRouter()

@router.get("/api/sector-map")
def get_sector_map(db: Session = Depends(get_db)):
    rows = db.query(TickerMetadata).all()

    sector_map = {}
    for row in rows:
        if row.sector is None:
            continue
        sector_map.setdefault(row.sector, []).append({
            "ticker": row.ticker,
            "name": row.name
        })

    return sector_map
