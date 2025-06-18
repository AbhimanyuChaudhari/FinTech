import { useParams } from "react-router-dom";

export default function FinancialAnalysisPage() {
  const { ticker } = useParams();

  return (
    <div style={{ padding: "2rem", background: "#0f172a", color: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
        📊 Financial Analysis for {ticker}
      </h1>
      <p style={{ color: "#94a3b8" }}>
        Coming soon: cash flow, income statement, balance sheet...
      </p>
    </div>
  );
}
