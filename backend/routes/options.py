# backend/routes/options.py
import yfinance as yf
from fastapi import APIRouter
import math

router = APIRouter()

def clean_float(val):
    try:
        if val is None or isinstance(val, str):
            return None
        f = float(val)
        return None if math.isnan(f) or math.isinf(f) else f
    except:
        return None

@router.get("/{symbol}")
async def get_options(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        current_price = ticker.info.get("regularMarketPrice", None)
        expiries = ticker.options
        if not expiries or current_price is None:
            return {"data": [], "price": current_price}

        results = []
        for expiry in expiries:
            chain = ticker.option_chain(expiry)
            for opt_type, df in [("call", chain.calls), ("put", chain.puts)]:
                for _, row in df.iterrows():
                    results.append({
                        "type": opt_type,
                        "symbol": symbol.upper(),
                        "expiry": expiry,
                        "strike": clean_float(row.get("strike")),
                        "bid": clean_float(row.get("bid")),
                        "ask": clean_float(row.get("ask")),
                        "iv": clean_float(row.get("impliedVolatility")),
                        "volume": clean_float(row.get("volume")),
                        "openInterest": int(row["openInterest"]) if not math.isnan(row["openInterest"]) else 0
                    })

        return {
            "data": results,
            "price": current_price
        }
    except Exception as e:
        return {"error": str(e)}
