// src/pages/TechnicalAnalysisPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TechnicalAnalysisPage() {
  const { ticker } = useParams();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/technical/${ticker}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) setResult(data.result);
        else setResult("⚠️ Failed to load data.");
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  return (
    <div style={{
      background: "#0f172a",
      color: "#f9fafb",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "monospace",
    }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        📊 Technical Analysis: {ticker?.toUpperCase()}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre style={{
          background: "#1e293b",
          padding: "1.5rem",
          borderRadius: "10px",
          fontSize: "0.95rem",
          whiteSpace: "pre-wrap",
          overflowX: "auto",
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}
