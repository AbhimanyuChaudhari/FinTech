def fetch_ohlc_alphavantage(ticker: str, interval: str = "15min", function: str = "TIME_SERIES_INTRADAY", apikey: str = "YOUR_API_KEY"):
    import requests
    import pandas as pd

    base_url = "https://www.alphavantage.co/query"
    params = {
        "function": function,
        "symbol": ticker,
        "apikey": apikey,
        "datatype": "json",
        "outputsize": "full"
    }

    if function == "TIME_SERIES_INTRADAY":
        params["interval"] = interval

    response = requests.get(base_url, params=params)
    data = response.json()

    # Determine correct key
    if function == "TIME_SERIES_INTRADAY":
        key = f"Time Series ({interval})"
    elif function == "TIME_SERIES_DAILY":
        key = "Time Series (Daily)"
    elif function == "TIME_SERIES_WEEKLY":
        key = "Weekly Time Series"
    elif function == "TIME_SERIES_MONTHLY":
        key = "Monthly Time Series"
    else:
        raise ValueError("Unsupported Alpha Vantage function.")

    if key not in data:
        raise ValueError(f"Unexpected response: {data}")

    df = pd.DataFrame.from_dict(data[key], orient="index")
    df = df.rename(columns={
        "1. open": "Open",
        "2. high": "High",
        "3. low": "Low",
        "4. close": "Close",
        "5. volume": "Volume"
    })
    df.index.name = "Date"
    df.reset_index(inplace=True)
    df["Ticker"] = ticker.upper()
    df = df[["Date", "Ticker", "Open", "High", "Low", "Close", "Volume"]]
    df.insert(0, 'id', range(1, len(df) + 1))
    df = df.sort_values("Date").reset_index(drop=True)

    return df.to_dict(orient="records")
