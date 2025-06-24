// src/components/Navbar/Navbar.tsx
import { Link } from "react-router-dom";
import MarketsDropdown from "./MarketsDropdown";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#111827",
        color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>AI Fund</div>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        {/* Main links that aren’t in the dropdown */}
        {["Home", "About", "Watchlist"].map((name) => (
          <Link
            key={name}
            to={name === "Home" ? "/" : `/${name.toLowerCase()}`}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
          >
            {name}
          </Link>
        ))}

        {/* Markets dropdown lives here */}
        <MarketsDropdown />

        {/* Auth */}
        <Link
          to="/login"
          style={{
            padding: "6px 16px",
            backgroundColor: "#60a5fa",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Sign Up / Sign In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
