import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
import os

def load_api_key(filename="alpha_vantage_api.txt"):
    file_path = os.path.join(os.path.dirname(__file__), filename)
    with open(file_path, 'r') as f:
        return f.read().strip()

def fetch_news_sentiment(ticker, api_key):
    url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={ticker}&apikey={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get("feed", [])
    else:
        raise Exception(f"API request failed: {response.status_code}")

def process_news_feed(news_feed):
    data = []
    for item in news_feed:
        title = item.get('title', '')
        summary = item.get('summary', '')
        sentiment = item.get('overall_sentiment_label', 'Neutral')
        text = f"{title} {summary}".strip()
        data.append((text, sentiment))
    return pd.DataFrame(data, columns=["text", "sentiment"])

def train_sentiment_model(df):
    X = df["text"]
    y = df["sentiment"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = make_pipeline(TfidfVectorizer(), MultinomialNB())
    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy:.2f}")
    return model

def predict_sentiment(model, new_text):
    return model.predict([new_text])[0]

if __name__ == "__main__":
    ticker = "AAPL"  # Change to your desired ticker
    api_key = load_api_key("alpha_vantage_api.txt")
    print("[+] Fetching news...")
    news_feed = fetch_news_sentiment(ticker, api_key)
    print(f"[+] Fetched {len(news_feed)} articles.")
    df = process_news_feed(news_feed)
    print(df.head())
    print("[+] Training sentiment model...")
    model = train_sentiment_model(df)
    sample = "Apple stock rises after strong iPhone sales report."
    predicted = predict_sentiment(model, sample)
    print(f"\n[+] Predicted sentiment for:\n'{sample}' → {predicted}")
