from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from backend.Stat_Models.VAR_Model import VAR  # adjust path if needed
import numpy as np

router = APIRouter()

class VARRequest(BaseModel):
    tickers: List[str]
    start: str
    end: str
    steps: int = 20
    max_lag: int = 5

@router.post("/statistical/var")
def run_var_forecast(request: VARRequest):
    try:
        model = VAR(request.tickers, max_lag=request.max_lag)
        log_returns = model.load_data(start=request.start, end=request.end)
        model.fit()
        forecasted_log_returns = model.forecast(steps=request.steps)
        forecasted_prices = model.reconstruct_prices(forecasted_log_returns)

        return {
            "forecasted_log_returns": forecasted_log_returns.tolist(),   # ✅ NumPy → list
            "forecasted_prices": forecasted_prices.tolist(),             # ✅ NumPy → list
            "original_log_returns": np.array(log_returns).tolist(),      # ✅ Ensures .tolist() works
            "tickers": request.tickers
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
