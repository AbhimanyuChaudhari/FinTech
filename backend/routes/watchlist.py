from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
models import Watchlist
db import get_db

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

@router.get("/{user_id}")
def get_watchlist(user_id: int, db: Session = Depends(get_db)):
    items = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()
    return [{"ticker": item.ticker} for item in items]

@router.post("/{user_id}")
def add_to_watchlist(user_id: int, ticker: str, db: Session = Depends(get_db)):
    exists = db.query(Watchlist).filter(Watchlist.user_id == user_id, Watchlist.ticker == ticker.upper()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Ticker already in watchlist")
    
    item = Watchlist(user_id=user_id, ticker=ticker.upper())
    db.add(item)
    db.commit()
    return {"status": "added", "ticker": ticker.upper()}

@router.delete("/{user_id}/{ticker}")
def remove_from_watchlist(user_id: int, ticker: str, db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter(Watchlist.user_id == user_id, Watchlist.ticker == ticker.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ticker not found in watchlist")
    db.delete(item)
    db.commit()
    return {"status": "removed", "ticker": ticker.upper()}
