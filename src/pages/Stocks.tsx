import { useState } from "react";
import { useStockDashboard } from "../hooks/stockDashboard";

const Stocks = () => {
  const {
    sectorMap,
    selectedSector,
    setSelectedSector,
    loading,
  } = useStockDashboard();

  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return <div style={{ padding: "2rem", color: "#fff" }}>Loading sectors...</div>;
  }

  const tickers = sectorMap[selectedSector] || [];

  const filteredTickers = tickers.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "#f9fafb",
        padding: "2rem",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
        📊 Stocks by Sector
      </h1>

      {/* Sector Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {Object.keys(sectorMap).map((sector) => (
          <button
            key={sector}
            onClick={() => {
              setSelectedSector(sector);
              setSearchQuery("");
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              backgroundColor: selectedSector === sector ? "#2563eb" : "#1e293b",
              color: selectedSector === sector ? "#ffffff" : "#cbd5e1",
              border: "1px solid #334155",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Search within selected sector */}
      <input
        type="text"
        placeholder="Search stock in this sector..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          color: "#f9fafb",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "1rem",
          fontSize: "0.85rem",
        }}
      />

      {/* Scrollable Ticker List */}
      <div
        style={{
          maxHeight: "520px",
          overflowY: "auto",
          borderRadius: "8px",
          border: "1px solid #334155",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {filteredTickers.map((ticker, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr 1fr auto",
              alignItems: "center",
              backgroundColor: "#1e293b",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#e2e8f0",
              border: "1px solid #2f3e51",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#273549";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1e293b";
            }}
          >
            <div>{ticker}</div>
            <div style={{ color: "#94a3b8" }}>{ticker} Stock</div>
            <div style={{ color: "#facc15", textAlign: "right" }}>$203.92</div>
            <div style={{ color: "#4ade80", textAlign: "right" }}>+1.64%</div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                style={{
                  padding: "4px 10px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Watchlist
              </button>
              <button
                style={{
                  padding: "4px 10px",
                  backgroundColor: "transparent",
                  color: "#e0f2fe",
                  border: "1px solid #475569",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
                onClick={() => alert(`Viewing ${ticker}`)}
              >
                Details
              </button>
            </div>
          </div>
        ))}

        {filteredTickers.length === 0 && (
          <div style={{ padding: "1rem", color: "#94a3b8", fontStyle: "italic" }}>
            No tickers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
