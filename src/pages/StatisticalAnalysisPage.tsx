import { useParams, useNavigate } from "react-router-dom";

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

// Supported models that have dedicated pages
const implementedModels = ["AR", "MA", "ARMA", "ARIMA", "SARIMA", "ARIMAX",
  "VAR"
];

export default function StatisticalAnalysisPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const handleModelClick = (model: string) => {
    if (implementedModels.includes(model)) {
      navigate(`/stock/${ticker}/statistical/${model.toLowerCase()}`);
    } else {
      alert(`${model} is not implemented yet.`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-800 border-r border-slate-700 p-6">
        <h2 className="text-sky-400 text-lg font-semibold mb-4">📊 Statistical Toolbox</h2>
        <ul className="space-y-2">
          {models.map(({ category, items }) => (
            <li key={category}>
              <h3 className="font-semibold text-slate-300 mb-1">{category}</h3>
              <ul className="pl-4 list-disc space-y-1">
                {items.map((model) => {
                  const isImplemented = implementedModels.includes(model);
                  return (
                    <li
                      key={model}
                      className={`cursor-pointer transition-colors ${
                        isImplemented
                          ? "hover:text-sky-400"
                          : "text-slate-500 cursor-not-allowed"
                      }`}
                      onClick={() => isImplemented && handleModelClick(model)}
                    >
                      {model}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">
          Statistical Analysis for{" "}
          <span className="text-sky-400">{ticker}</span>
        </h1>
        <p className="text-slate-400">
          Select a model from the sidebar to begin forecasting.
        </p>
      </main>
    </div>
  );
}
