// src/components/MarketsDropdown/MarketsDropdown.tsx
import { Link } from "react-router-dom";
import { useState } from "react";

const markets = ["Stocks", "Options", "Futures", "Bonds", "ETFs"];

const MarketsDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{ cursor: "pointer", fontWeight: 500 }}>
        Markets ▾
      </span>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#1f2937",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            padding: "0.5rem 0",
            borderRadius: 4,
            zIndex: 1000,
          }}
        >
          {markets.map((m) => (
            <Link
              key={m}
              to={`/${m.toLowerCase()}`}
              style={{
                display: "block",
                padding: "0.5rem 1.5rem",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            >
              {m}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketsDropdown;
