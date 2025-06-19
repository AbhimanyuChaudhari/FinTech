// src/pages/FinancialAnalysisPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface FinanceData {
  Valuation: Record<string, number>;
  Profitability: Record<string, number>;
  Liquidity: Record<string, number>;
  Solvency: Record<string, number>;
  Efficiency: Record<string, number>;
  CashFlow: Record<string, number>;
  FinalScore: number;
  InvestmentRating: string;
}

export default function FinancialAnalysisPage() {
  const { ticker } = useParams();
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/finance/${ticker}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error loading financial data", err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) fetchData();
  }, [ticker]);

  if (loading) return <div style={{ color: "#fff", padding: "2rem" }}>Loading analysis...</div>;
  if (!data) return <div style={{ color: "#fff", padding: "2rem" }}>No data available.</div>;

  const metricGroups = [
    { title: "Valuation", data: data.Valuation },
    { title: "Profitability", data: data.Profitability },
    { title: "Liquidity", data: data.Liquidity },
    { title: "Solvency", data: data.Solvency },
    { title: "Efficiency", data: data.Efficiency },
    { title: "Cash Flow", data: data.CashFlow },
  ];

  return (
    <div
      style={{
        background: "#0f172a",
        color: "#f9fafb",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        💹 {ticker} Financial Analysis
      </h1>

      {/* Summary Section */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            fontSize: "1.25rem",
            fontWeight: 600,
            flex: "1 1 250px",
          }}
        >
          📈 Investment Rating:{" "}
          <span style={{ color: "#22c55e" }}>{data.InvestmentRating}</span>
        </div>
        <div
          style={{
            background: "#1e293b",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            fontSize: "1.25rem",
            fontWeight: 600,
            flex: "1 1 250px",
          }}
        >
          🧮 Final Score:{" "}
          <span style={{ color: "#fbbf24" }}>{data.FinalScore.toFixed(2)}</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {metricGroups.map(({ title, data }) => (
          <div
            key={title}
            style={{
              background: "#1e293b",
              borderRadius: "10px",
              padding: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#38bdf8" }}>
              {title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {Object.entries(data).map(([key, val]) => (
                <li
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #334155",
                    padding: "4px 0",
                    fontSize: "0.95rem",
                  }}
                >
                  <span>{key}</span>
                  <span>{val.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
