import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import time
import psycopg2

TICKERS = pd.read_csv('all_tickers.csv')
tickers = list(TICKERS['Ticker'])

#Establishing the connection with the database
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="04082001@Abhi",
    host="localhost",
    port=5432
)
cur = conn.cursor()

#Inserting the MetaData into the database. This code takes a lot of time to run so don't run unless necessary
#Otherwise directly access the database or use api endpoints which are created in backend folder 
for ticker in tickers:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        name = info.get("longName") or info.get("shortName")
        sector = info.get("sector")
        industry = info.get("industry")
        exchange = info.get("exchange")
        market_cap = info.get("marketCap")
        is_etf = info.get("quoteType") == "ETF"
        cur.execute("""
            INSERT INTO ticker_metadata (ticker, name, sector, industry, exchange, market_cap, is_etf)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ticker) DO UPDATE
            SET name = EXCLUDED.name,
                sector = EXCLUDED.sector,
                industry = EXCLUDED.industry,
                exchange = EXCLUDED.exchange,
                market_cap = EXCLUDED.market_cap,
                is_etf = EXCLUDED.is_etf;
        """, (ticker, name, sector, industry, exchange, market_cap, is_etf))
        print(f"[+] Inserted {ticker}")
        time.sleep(0.5)  
    except Exception as e:
        print(f"[!] Error for {ticker}: {e}")


conn.commit()
cur.close()
conn.close()