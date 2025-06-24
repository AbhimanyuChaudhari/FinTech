from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

class HedgeRequest(BaseModel):
    ticker: str
    shares: int
    risk_level: Literal["Low", "Medium", "High"]
    price: float

class HedgeResponse(BaseModel):
    strategy: str
    strike: float
    expiry: str
    cost: float

@router.post("/hedge", response_model=HedgeResponse)
def generate_hedge(req: HedgeRequest):
    # basic logic
    if req.risk_level == "High":
        strike = req.price
    elif req.risk_level == "Medium":
        strike = req.price * 0.95
    else:
        strike = req.price * 0.90

    rounded_strike = round(strike / 5) * 5
    expiry = "2025-07-12"  # mock; later choose dynamically
    cost = round(0.02 * req.price * (req.shares / 100), 2)

    return HedgeResponse(
        strategy="Protective Put",
        strike=rounded_strike,
        expiry=expiry,
        cost=cost
    )
