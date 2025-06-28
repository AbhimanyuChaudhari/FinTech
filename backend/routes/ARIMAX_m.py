from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.Stat_Models.ARIMAX_Model import ARIMAX

router = APIRouter()

class ArimaxRequest(BaseModel):
    ticker: str
    exog_ticker: str
    start: str
    end: str
    steps: int = 20
    d: int = 1
    max_p: int = 5
    max_q: int = 5

@router.post("/statistical/arimax")
def run_arimax_forecast(request: ArimaxRequest):
    try:
        model = ARIMAX(
            d=request.d,
            max_p=request.max_p,
            max_q=request.max_q,
        )

        log_returns, exog = model.load_data(
            ticker=request.ticker,
            exog_ticker=request.exog_ticker,
            start=request.start,
            end=request.end,
        )

        model.evaluate_orders()

        forecasted_log_returns = model.forecast(steps=request.steps)
        actual_prices, forecasted_prices = model.reconstruct_prices(forecasted_log_returns)

        return {
            "forecasted_log_returns": forecasted_log_returns.tolist(),
            "forecasted_prices": forecasted_prices.tolist(),
            "actual_prices": actual_prices.tolist(),
            "best_p": model.best_p,
            "best_q": model.best_q,
            "mse": model.best_mse,
            "mae": model.best_mae,
            "original_log_returns": log_returns.tolist()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
