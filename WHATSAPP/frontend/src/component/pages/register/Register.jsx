import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../Navbar/Navbar";
import "../../../styles/shell.css";
import "../../../styles/auth.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const data = await register(form.name, form.email, form.password);
      setSuccess(data.message || "Registration successful. You can now log in.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => navigate("/login"), 1200);
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
              Get started in 3 steps
            </p>
            <div className="auth-visual-panel__row">
              <span>1. Create your account</span>
              <span>&lt; 1 min</span>
            </div>
            <div className="auth-visual-panel__row">
              <span>2. Connect WhatsApp Business</span>
              <span>Guided</span>
            </div>
            <div className="auth-visual-panel__row">
              <span>3. Generate an API key</span>
              <span>Instant</span>
            </div>
          </div>
        </div>

        <div className="auth-caption">
          <p className="auth-caption-label">Business messaging infrastructure</p>
          <p className="auth-caption-text">
            One account, one API key, unlimited WhatsApp messages from any
            app you build.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Create your account.</h1>
          <p className="auth-subtitle">
            Start connecting WhatsApp Business to your applications.
          </p>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {success && <div className="auth-alert auth-alert-success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-label" htmlFor="name">
              Full name
            </label>
            <div className="auth-input-group">
              <svg
                className="auth-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c1.2-3.6 4-5.4 7-5.4S18.8 16.4 20 20" />
              </svg>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Carter"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

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

            <label className="auth-label" htmlFor="password">
              Password
            </label>
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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <label className="auth-label" htmlFor="confirmPassword">
              Confirm password
            </label>
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
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: 24 }}>
            Already have an account? <Link to="/login">Log in.</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
