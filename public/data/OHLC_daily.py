# Dont run this code the database is already created it is just for the reference 
# This is just for understading how database was creating and re-rerun this if new tickers are introduced

import yfinance as yf
import pandas as pd
import psycopg2
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

def get_connection():
    return psycopg2.connect(
        dbname="postgres",        
        user="postgres",        
        password="04082001@Abhi",
        host="localhost",        
        port="5432"              
    )

def insert_ohlc_to_db(df, conn):
    with conn.cursor() as cur:
        for _, row in df.iterrows():
            try:
                cur.execute("""
                    INSERT INTO ohlc_daily (ticker, date, open, high, low, close, volume)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (ticker, date) DO NOTHING
                """, (
                    row['Ticker'],
                    row['Date'],
                    float(row['Open']) if pd.notna(row['Open']) else None,
                    float(row['High']) if pd.notna(row['High']) else None,
                    float(row['Low']) if pd.notna(row['Low']) else None,
                    float(row['Close']) if pd.notna(row['Close']) else None,
                    int(row['Volume']) if pd.notna(row['Volume']) else None
                ))
            except Exception as e:
                print(f"{row['Ticker']} on {row['Date']} - INSERT ERROR: {e}")

def fetch_and_store(ticker: str):
    try:
        raw_df = yf.download(ticker, start="1990-01-01", progress=False)
        if raw_df.empty:
            print(f"{ticker} - No data")
            return
        if isinstance(raw_df.columns, pd.MultiIndex):
            if ticker not in raw_df.columns.levels[1]:
                print(f"{ticker} - Not found in MultiIndex")
                return
            df = raw_df.xs(ticker, axis=1, level=1)
        else:
            df = raw_df.copy()
        required = ['Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in df.columns for col in required):
            print(f"{ticker} - Missing columns")
            return
        df = df.reset_index()
        df['Ticker'] = ticker
        df = df[['Ticker', 'Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
        df['Date'] = pd.to_datetime(df['Date']).dt.date
        conn = get_connection()
        insert_ohlc_to_db(df, conn)
        conn.commit()
        conn.close()
        print(f"{ticker} - Inserted {len(df)} rows")
    except Exception as e:
        print(f"{ticker} - ERROR : {e}")

tickers = pd.read_csv('all_tickers.csv')  # This CSV contains all the tickers present in US market
tickers = list(tickers['Ticker'])
tickers = tickers[7001:8000] #Change the range accordignly because it take a lot of time to run not very efficient though

if __name__ == "__main__":
    for ticker in tickers:
        fetch_and_store(ticker)