// src/pages/SentimentAnalysisPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Article {
  text: string;
  sentiment: string;
}

export default function SentimentAnalysisPage() {
  const { ticker } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const fetchSentiment = async () => {
      try {
        const res = await fetch(`https://fintech-backend-80wz.onrender.com/api/sentiment/${ticker}`);
        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching sentiment data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [ticker]);

  if (!ticker) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>Invalid ticker.</div>
    );
  }

  return (
    <div style={{ background: "#0f172a", color: "#f9fafb", padding: "2rem", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
        🧠 Sentiment Analysis: {ticker}
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : articles.length === 0 ? (
        <div>No sentiment data available.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {articles.map((article, index) => (
            <div
              key={index}
              style={{
                background: "#1e293b",
                padding: "1rem",
                borderRadius: "8px",
                borderLeft: `4px solid ${
                  article.sentiment.includes("Bullish") ? "#22c55e" :
                  article.sentiment.includes("Bearish") ? "#ef4444" : "#facc15"
                }`,
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>{article.text}</p>
              <strong style={{ color: "#94a3b8" }}>Sentiment: {article.sentiment}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
