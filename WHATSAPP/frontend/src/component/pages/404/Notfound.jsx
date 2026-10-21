import React from "react";
import { Link } from "react-router-dom";
import "../../../styles/shell.css";

const NotFound = () => {
  return (
    <div className="w-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <Link to="/" className="w-navbar__logo" style={{ justifyContent: "center", marginBottom: 28 }}>
          {"<"}
          <span className="accent">Waply</span>
          {"/>"}
        </Link>
        <p className="w-eyebrow" style={{ marginBottom: 4 }}>Error 404</p>
        <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Page not found
        </h1>
        <p style={{ color: "var(--w-muted)", marginBottom: 28, maxWidth: 420 }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="w-btn w-btn--primary">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
