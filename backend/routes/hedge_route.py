from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, List, Dict
from backend.hedge_engine import select_strategy

router = APIRouter()

# Request model
class HedgeRequest(BaseModel):
    ticker: str
    shares: int
    price: float
    risk_level: Literal["Low", "Medium", "High"]
    options_chain: List[Dict]  # Option chain is passed from frontend

# Route definition (use relative path only)
@router.post("/hedge")
def generate_hedge(req: HedgeRequest):
    try:
        result = select_strategy(
            ticker=req.ticker,
            shares=req.shares,
            price=req.price,
            risk_level=req.risk_level,
            options_chain=req.options_chain
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
