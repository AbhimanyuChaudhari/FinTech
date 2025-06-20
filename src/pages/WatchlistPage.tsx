import { useEffect, useState } from "react";

export default function WatchlistPage() {
  const userId = 1;
  const [tickers, setTickers] = useState<string[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [suggestions, setSuggestions] = useState<{ ticker: string, name: string, sector: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchWatchlist = () => {
    fetch(`http://localhost:8000/api/watchlist/${userId}`)
      .then(res => res.json())
      .then(data => setTickers(data.map((item: any) => item.ticker)));
  };

  const addTicker = () => {
    if (!newTicker.trim()) return;
    fetch(`http://localhost:8000/api/watchlist/${userId}?ticker=${newTicker}`, { method: "POST" })
      .then(() => {
        setNewTicker("");
        setSuggestions([]);
        setShowSuggestions(false);
        fetchWatchlist();
      });
  };

  const removeTicker = (ticker: string) => {
    fetch(`http://localhost:8000/api/watchlist/${userId}/${ticker}`, { method: "DELETE" })
      .then(() => fetchWatchlist());
  };

  const searchTickerMetadata = (query: string) => {
    setNewTicker(query);
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    fetch(`http://localhost:8000/api/search?query=${query}`)
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setShowSuggestions(true);
      });
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <div style={{
      background: "#0f172a",
      color: "#f9fafb",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "monospace",
      position: "relative"
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
         Watchlist
      </h1>

      {/* Search & Suggestion */}
      <div style={{ marginBottom: "1rem", position: "relative", width: "300px" }}>
        <input
          type="text"
          value={newTicker}
          placeholder="Enter ticker or company"
          onChange={(e) => searchTickerMetadata(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTicker();
            }
          }}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "1px solid #334155",
            backgroundColor: "#1e293b",
            color: "#f9fafb",
            fontSize: "1rem",
            width: "100%"
          }}
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: "absolute",
            backgroundColor: "#1e293b",
            color: "#f9fafb",
            listStyle: "none",
            padding: "0.5rem 0",
            borderRadius: "6px",
            width: "100%",
            marginTop: "0.3rem",
            zIndex: 1000,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {suggestions.map((s) => (
              <li
                key={s.ticker}
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #334155"
                }}
                onClick={() => {
                  setNewTicker(s.ticker);
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                <strong>{s.ticker}</strong> – {s.name}
                <span style={{ color: "#94a3b8" }}> ({s.sector})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={addTicker}
        style={{
          padding: "0.6rem 1.4rem",
          background: "linear-gradient(90deg, #22c55e, #16a34a)",
          color: "#fff",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem",
          boxShadow: "0 2px 6px rgba(34,197,94,0.4)",
          transition: "transform 0.2s, background 0.3s",
          marginBottom: "2rem"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ➕ Add to Watchlist
      </button>

      {/* Watchlist Cards */}
      {tickers.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>You haven't added any tickers yet.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.2rem"
        }}>
          {tickers.map((ticker) => (
            <div
              key={ticker}
              style={{
                backgroundColor: "#1e293b",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{ticker}</span>
              <button
                onClick={() => removeTicker(ticker)}
                style={{
                  background: "transparent",
                  color: "#f87171",
                  border: "none",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
