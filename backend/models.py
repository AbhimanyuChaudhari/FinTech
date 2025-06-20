from sqlalchemy import Column, String, Boolean, BigInteger, TIMESTAMP, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer, Float, ForeignKey

Base = declarative_base()

class TickerMetadata(Base):
    __tablename__ = "ticker_metadata"

    ticker = Column(String, primary_key=True, index=True)
    name = Column(String)
    sector = Column(String, index=True)
    industry = Column(String)
    exchange = Column(String)
    market_cap = Column(BigInteger)
    is_etf = Column(Boolean)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    ticker = Column(String, ForeignKey("ticker_metadata.ticker"), nullable=False)

class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    ticker = Column(String, ForeignKey("ticker_metadata.ticker"), nullable=False)
    quantity = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)


