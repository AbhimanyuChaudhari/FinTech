import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import StockCandleChart from "../components/StockCandleChart"; // ✅ Make sure the path is correct
import {
  BarChart3,
  Brain,
  Microscope,
  FlaskConical,
  Sigma,
} from "lucide-react";

const intervals = ["1min", "5min", "15min", "30min", "60min", "1d", "1wk", "1mo"];

export default function StockDetailPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [interval, setInterval] = useState("15min");

  if (!ticker) {
    return (
      <div
        style={{
          backgroundColor: "#0f172a",
          color: "#fef2f2",
          padding: "2rem",
          textAlign: "center",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ fontSize: "1.5rem" }}>❌ Invalid Ticker</h2>
        <p>Please select a valid stock from the list.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
        color: "#f9fafb",
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
      }}
    >
      {/* Sidebar Buttons */}
      <div
        style={{
          position: "sticky",
          top: "30%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          background: "#1e293b",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          height: "fit-content",
        }}
      >
        {[
          { icon: <BarChart3 size={20} />, label: "Financial Analysis", path: "financial" },
          { icon: <Brain size={20} />, label: "Sentiment Analysis", path: "sentiment" },
          { icon: <Microscope size={20} />, label: "Technical Analysis", path: "technical" },
          { icon: <FlaskConical size={20} />, label: "Strategy Testing", path: "strategy" },
          { icon: <Sigma size={20} />, label: "Statistical Analysis", path: "statistical" },
        ].map(({ icon, label, path }) => (
          <div
            key={label}
            title={label}
            onClick={() => navigate(`/stock/${ticker}/${path}`)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              background: "#0f172a",
              borderRadius: "50%",
              color: "#cbd5e1",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Main Chart Area */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          📈 {ticker} Stock Dashboard
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          Explore data for <strong>{ticker}</strong> in various intervals.
        </p>

        {/* Timeframe Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="interval" style={{ marginRight: "0.5rem" }}>Select Timeframe:</label>
          <select
            id="interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={{
              backgroundColor: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px"
            }}
          >
            {intervals.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Chart Component */}
        <StockCandleChart ticker={ticker} interval={interval} />
      </div>
    </div>
  );
}
