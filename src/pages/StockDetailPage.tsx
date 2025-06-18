import { useParams, useNavigate } from "react-router-dom";
import StockDetail from "../components/StockDetail";
import { BarChart3, Brain, Microscope, FlaskConical, Sigma } from "lucide-react";

export default function StockDetailPage() {
  const { ticker } = useParams();
  const navigate = useNavigate(); // ✅ for programmatic routing

  if (!ticker) {
    return (
      <div style={{
        backgroundColor: "#0f172a",
        color: "#fef2f2",
        padding: "2rem",
        textAlign: "center",
        minHeight: "100vh"
      }}>
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
          zIndex: 1000,
          height: "fit-content"
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
            onClick={() => navigate(`/stock/${ticker}/${path}`)} // ✅ navigation on click
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
              position: "relative",
            }}
          >
            {icon}
            <span
              style={{
                position: "absolute",
                left: "60px",
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                opacity: 0,
                transition: "opacity 0.2s ease-in-out",
              }}
              className="hover-label"
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Chart View */}
      <div style={{ flex: 1, overflowX: "auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          📈 {ticker} Stock Dashboard
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
          Dive into the technicals, financials, and strategies for <strong>{ticker}</strong>.
        </p>
        <StockDetail ticker={ticker} onClose={() => window.history.back()} />
      </div>
    </div>
  );
}
