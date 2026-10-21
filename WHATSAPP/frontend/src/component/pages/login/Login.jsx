import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../Navbar/Navbar";
import "../../../styles/shell.css";
import "../../../styles/auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdminLogin = async () => {
    setError("");
    setAdminLoading(true);
    const adminEmail = "admin@example.com";
    const adminPassword = "123456";
    setForm({ email: adminEmail, password: adminPassword });
    try {
      const user = await login(adminEmail, adminPassword);
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page auth-page--with-nav">
        {/* Left visual panel */}
        <div className="auth-visual">
          <Link to="/" className="auth-logo">
            {"<"}
            <span className="accent">Waply</span>
            {"/>"}
          </Link>

        <div className="auth-visual-center">
          <div className="auth-visual-panel">
            <p className="auth-visual-panel__label">
              <span className="auth-visual-panel__dot" />
              WhatsApp Cloud API — Live
            </p>
            <div className="auth-visual-panel__row">
              <span>Connection status</span>
              <span>Connected</span>
            </div>
            <div className="auth-visual-panel__row">
              <span>Messages sent today</span>
              <span>4,218</span>
            </div>
            <div className="auth-visual-panel__row">
              <span>Avg. delivery latency</span>
              <span>~ 210ms</span>
            </div>
            <div className="auth-visual-panel__row">
              <span>Active API keys</span>
              <span>3</span>
            </div>
          </div>
        </div>

        <div className="auth-caption">
          <p className="auth-caption-label">Business messaging infrastructure</p>
          <p className="auth-caption-text">
            Connect your WhatsApp Business account and get an API key to
            send messages from your own apps in minutes.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back.</h1>
          <p className="auth-subtitle">
            Sign in to manage your WhatsApp connection and API keys.
          </p>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-label" htmlFor="email">
              Email address
            </label>
            <div className="auth-input-group">
              <svg
                className="auth-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-label-row">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
            </div>
            <div className="auth-input-group">
              <svg
                className="auth-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading || adminLoading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <div className="auth-separator">or</div>

          <button
            type="button"
            className="auth-btn-admin"
            onClick={handleAdminLogin}
            disabled={loading || adminLoading}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{adminLoading ? "Authenticating Admin…" : "One-Click Login as Admin"}</span>
          </button>

          <p className="auth-footer-text" style={{ marginTop: 24 }}>
            Don't have an account? <Link to="/register">Create one.</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
