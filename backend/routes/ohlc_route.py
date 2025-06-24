from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import Literal
from utils.ohlc_utils import fetch_ohlc_alphavantage

router = APIRouter()

@router.get("/ohlc", tags=["OHLC"])
def get_ohlc_data(
    ticker: str = Query(...),
    interval: Literal["1min", "5min", "15min", "30min", "60min", "1d", "1wk", "1mo"] = "1d"
):
    try:
        # Determine which function to call
        if interval in ["1min", "5min", "15min", "30min", "60min"]:
            function = "TIME_SERIES_INTRADAY"
        elif interval == "1d":
            function = "TIME_SERIES_DAILY"
        elif interval == "1wk":
            function = "TIME_SERIES_WEEKLY"
        elif interval == "1mo":
            function = "TIME_SERIES_MONTHLY"
        else:
            raise ValueError("Unsupported interval.")

        # Fetch data
        ohlc_data = fetch_ohlc_alphavantage(ticker, interval=interval, function=function, apikey="your_api_key")
        return JSONResponse(content=ohlc_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
