// src/pages/FinancialAnalysisPage.tsx
import { useParams } from "react-router-dom";

export default function StrategyTestingPage() {
  const { ticker } = useParams();
  return (
    <div style={{ padding: "2rem", background: "#0f172a", color: "#f9fafb", minHeight: "100vh" }}>
      <h1>📊 Strategy Testing for {ticker}</h1>
      <p>Coming soon...</p>
    </div>
  );
}
