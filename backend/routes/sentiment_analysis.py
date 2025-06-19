# backend/routes/sentiment.py
from fastapi import APIRouter
from backend.sentiment_analysis import (
    load_api_key,
    fetch_news_sentiment,
    process_news_feed,
)

router = APIRouter(prefix="/api/sentiment", tags=["sentiment"])

@router.get("/{ticker}")
def get_sentiment_news(ticker: str):
    try:
        api_key = load_api_key("alpha_vantage_api.txt")
        news_feed = fetch_news_sentiment(ticker, api_key)
        df = process_news_feed(news_feed)
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}
