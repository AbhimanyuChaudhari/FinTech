import { Link } from "react-router-dom";
import {
  BarChart2,
  LineChart,
  Brain,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    title: "Financial Analysis",
    description:
      "Dive into balance sheets, ratios, and valuation metrics to uncover investment potential.",
    icon: <BarChart2 size={28} color="#0ea5e9" />,
  },
  {
    title: "Technical Analysis",
    description:
      "Analyze price patterns with advanced chart overlays, indicators, and momentum tools.",
    icon: <LineChart size={28} color="#0ea5e9" />,
  },
  {
    title: "Sentiment Analysis",
    description:
      "Gauge market mood from institutional flows, news trends, and social sentiment.",
    icon: <Brain size={28} color="#0ea5e9" />,
  },
  {
    title: "Strategy Testing",
    description:
      "Backtest trading ideas and simulate performance before going live.",
    icon: <SlidersHorizontal size={28} color="#0ea5e9" />,
  },
];

const Home = () => {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(to right, #0f172a, #1e3a8a)",
          color: "white",
          padding: "5rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://www.transparenttextures.com/patterns/diagmonds.png') repeat",
            opacity: 0.04,
            zIndex: 0,
          }}
        />
        {/* Candlestick chart image overlay */}
        <img
          src="https://i.imgur.com/b6aIfuP.png"
          alt="Candlestick chart background"
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "600px",
            opacity: 0.07,
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Trade Intelligently. Execute with Confidence.
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "620px",
              margin: "0 auto",
              opacity: 0.92,
            }}
          >
            Empower your decisions with AI-driven insights, technical precision,
            and data-backed strategies.
          </p>
          <Link to="/login">
            <button
              style={{
                marginTop: "2.5rem",
                padding: "14px 28px",
                backgroundColor: "#0ea5e9",
                color: "white",
                fontWeight: 600,
                fontSize: "1.05rem",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1.0)")
              }
            >
              Launch Platform →
            </button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          padding: "4.5rem 2rem",
          backgroundColor: "#f3f4f6",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "2rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 8px 16px rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={{ marginBottom: "1rem" }}>{feature.icon}</div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#374151" }}>
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "3.5rem 2rem",
          backgroundColor: "#1e293b",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Optional candlestick watermark */}
        <img
          src="https://i.imgur.com/b6aIfuP.png"
          alt="Candlestick CTA"
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            maxWidth: "280px",
            opacity: 0.04,
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 600, marginBottom: "1rem" }}>
            Ready to Elevate Your Edge?
          </h2>
          <p style={{ fontSize: "1rem", opacity: 0.88, marginBottom: "1.75rem" }}>
            Experience the future of fintech analysis and trading automation.
          </p>
          <Link to="/login">
            <button
              style={{
                padding: "13px 26px",
                backgroundColor: "#0ea5e9",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Sign Up Free →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
