def fetch_ohlc_alphavantage(
    ticker: str,
    interval: str = "15min",
    function: str = "TIME_SERIES_INTRADAY",
    apikey: str = "PE6B3MEJUZYOVPE5"
):
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

    try:
        data = response.json()
    except Exception as e:
        raise ValueError("Invalid JSON response from Alpha Vantage.") from e

    # Handle known Alpha Vantage error messages
    if "Error Message" in data:
        raise ValueError(f"Alpha Vantage error: {data['Error Message']}")
    if "Note" in data:
        raise ValueError(f"API limit reached: {data['Note']}")
    if "Information" in data:
        raise ValueError(f"Alpha Vantage info: {data['Information']}")

    # Determine expected key
    if function == "TIME_SERIES_INTRADAY":
        key = f"Time Series ({interval})"
    elif function == "TIME_SERIES_DAILY":
        key = "Time Series (Daily)"
    elif function == "TIME_SERIES_WEEKLY":
        key = "Weekly Time Series"
    elif function == "TIME_SERIES_MONTHLY":
        key = "Monthly Time Series"
    else:
        raise ValueError(f"Unsupported function: {function}")

    if key not in data:
        raise ValueError(f"Unexpected data format. Expected key '{key}', got: {list(data.keys())}")

    df = pd.DataFrame.from_dict(data[key], orient="index")
    df.columns = df.columns.str.strip()  # Clean any space
    df = df.rename(columns={
        "1. open": "Open",
        "2. high": "High",
        "3. low": "Low",
        "4. close": "Close",
        "5. volume": "Volume"
    })

    # Ensure columns exist
    required_cols = ["Open", "High", "Low", "Close"]
    if not all(col in df.columns for col in required_cols):
        raise ValueError(f"Missing expected columns in API response: {df.columns.tolist()}")

    df.index.name = "Date"
    df.reset_index(inplace=True)
    df["Ticker"] = ticker.upper()
    df = df[["Date", "Ticker", "Open", "High", "Low", "Close"]]  # Remove volume for brevity
    df.insert(0, 'id', range(1, len(df) + 1))
    df = df.sort_values("Date").reset_index(drop=True)

    return df.to_dict(orient="records")
