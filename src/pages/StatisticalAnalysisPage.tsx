import { useParams } from "react-router-dom";

const models = [
  {
    category: "Classic Models",
    items: ["AR", "MA", "ARMA", "ARIMA", "SARIMA"]
  },
  {
    category: "Advanced Models",
    items: ["ARIMAX", "VAR", "VARMA", "VARMAX"]
  },
  {
    category: "Non-linear & Hybrid",
    items: ["ARCH", "GARCH", "LSTM", "Prophet"]
  },
  {
    category: "Other Techniques",
    items: ["Fourier Transforms", "Kalman Filters", "Holt-Winters"]
  }
];

export default function StatisticalAnalysisPage() {
  const { ticker } = useParams();

  return (
    <div style={{ display: "flex", backgroundColor: "#0f172a", color: "#f9fafb", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", padding: "2rem 1rem", borderRight: "1px solid #1e293b", backgroundColor: "#1e293b" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#60a5fa" }}>📊 Statistical Toolbox</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {models.map((block) => (
            <li key={block.category} style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{block.category}</li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          Statistical Analysis for <span style={{ color: "#60a5fa" }}>{ticker}</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {models.map(({ category, items }) => (
            <div key={category} style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", border: "1px solid #334155" }}>
              <h3 style={{ fontSize: "1.1rem", color: "#93c5fd", marginBottom: "1rem" }}>{category}</h3>
              <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", color: "#f1f5f9" }}>
                {items.map((model) => (
                  <li key={model} style={{ marginBottom: "0.5rem", cursor: "pointer", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#f1f5f9")}
                      onClick={() => alert(`${model} clicked`)}>
                    {model}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
