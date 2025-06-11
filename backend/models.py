from sqlalchemy import Column, String, Boolean, BigInteger, TIMESTAMP, text
from sqlalchemy.ext.declarative import declarative_base

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
