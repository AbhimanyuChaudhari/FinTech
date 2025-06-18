import { useState } from "react";
import { useStockDashboard } from "../hooks/stockDashboard";
import { useNavigate } from "react-router-dom";
import { FaChartLine } from "react-icons/fa";

const Stocks = () => {
  const {
    sectorMap,
    selectedSector,
    setSelectedSector,
    loading,
  } = useStockDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  if (loading)
    return <div style={{ padding: "2rem", color: "#fff" }}>Loading...</div>;

  const tickers = sectorMap[selectedSector] || [];
  const filteredTickers = tickers.filter((t) =>
    t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: "#0f172a", color: "#f9fafb", padding: "2rem", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>📊 Stocks by Sector</h1>

      {/* Debug button */}
      <button
        onClick={() => {
          console.log("✅ TEST BUTTON CLICKED");
          navigate("/stock/AAPL");
        }}
        style={{ marginBottom: "1rem", padding: "0.5rem", background: "#2563eb", color: "#fff" }}
      >
        Force Load AAPL
      </button>

      {/* Sector Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
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
              color: selectedSector === sector ? "#fff" : "#cbd5e1",
              border: "1px solid #334155",
              cursor: "pointer",
              transition: "background-color 0.2s ease-in-out",
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search stock..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "10px 14px",
          background: "#1e293b",
          color: "#f9fafb",
          border: "1px solid #334155",
          borderRadius: "6px",
          marginBottom: "1.5rem",
          width: "100%",
          maxWidth: "400px",
          fontSize: "1rem",
        }}
      />

      {/* Stock Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredTickers.map(({ ticker, name, exchange }) => (
          <div
            key={ticker}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#1e293b",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              border: "1px solid #334155",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div>
              <strong style={{ fontSize: "1.1rem" }}>{ticker}</strong> - {name}
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{exchange}</div>
            </div>
            <button
              onClick={() => {
                console.log("Navigating to detail page for:", ticker);
                navigate(`/stock/${ticker}`);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "8px 20px",
                borderRadius: "6px",
                background: "linear-gradient(to right, #60a5fa, #2563eb)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)",
                transition: "transform 0.15s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
            >
              <FaChartLine /> View Details
            </button>
          </div>
        ))}

        {filteredTickers.length === 0 && (
          <div style={{ fontStyle: "italic", color: "#94a3b8" }}>No results found.</div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
