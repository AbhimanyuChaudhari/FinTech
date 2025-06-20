import { useParams } from "react-router-dom";
import { useState } from "react";

export default function RiskAnalysisPage() {
  const { ticker } = useParams();
  const [riskProfile, setRiskProfile] = useState("moderate");
  const [capital, setCapital] = useState(10000);
  const [timeframe, setTimeframe] = useState("1hour");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRiskAnalysis = () => {
    if (!ticker) return;
    setLoading(true);
    fetch(
      `http://localhost:8000/api/risk/${ticker}?risk_profile=${riskProfile}&capital=${capital}&timeframe=${timeframe}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.result) setResult(data.result);
        else setResult("⚠️ Failed to fetch risk analysis.");
      })
      .catch(() => setResult("⚠️ Error fetching risk analysis."))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{
      background: "#0f172a", color: "#f9fafb", minHeight: "100vh",
      padding: "2rem", fontFamily: "monospace"
    }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        🛡️ Risk Analysis: {ticker?.toUpperCase()}
      </h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Risk Profile: </label>
        <select value={riskProfile} onChange={e => setRiskProfile(e.target.value)}>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <label style={{ marginLeft: "1rem" }}>Capital ($): </label>
        <input
          type="number"
          value={capital}
          onChange={e => setCapital(Number(e.target.value))}
          style={{ width: "120px", marginLeft: "0.5rem" }}
        />

        <label style={{ marginLeft: "1rem" }}>Timeframe: </label>
        <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
          <option value="1min">1 Minute</option>
          <option value="5min">5 Minutes</option>
          <option value="15min">15 Minutes</option>
          <option value="30min">30 Minutes</option>
          <option value="1hour">1 Hour</option>
          <option value="1day">1 Day</option>
        </select>

        <button
          onClick={fetchRiskAnalysis}
          style={{
            marginLeft: "1rem", padding: "0.4rem 1rem", backgroundColor: "#3b82f6",
            color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          Run Analysis
        </button>
      </div>

      {loading ? (
        <p>Loading analysis...</p>
      ) : (
        <pre style={{
          background: "#1e293b", padding: "1.2rem", borderRadius: "10px",
          whiteSpace: "pre-wrap", fontSize: "0.95rem", overflowX: "auto"
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}
