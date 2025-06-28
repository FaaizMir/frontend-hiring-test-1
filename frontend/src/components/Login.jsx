import React, { useState } from "react";
import ttLogo from '../assets/TT Logo.png';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // state to hold username, password, and any error that might pop up
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // login handler function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // try logging in the user
      await loginUser(username, password);
      navigate("/dashboard"); // go to dashboard on success
    } catch (err) {
      // if login fails, show the error
      setError(err.message || "Login failed");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#f5eeee",
      }}
    >
      {/* Simple header with logo */}
      <header
        className="d-flex align-items-center px-4 py-2 border-bottom bg-white"
        style={{ height: "60px" }}
      >
        <img
          src={ttLogo}
          alt="Logo"
          style={{
            width: "10rem",
            height: "4rem",
            objectFit: "contain",
          }}
        />
      </header>

      {/* Login form area */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div
          className="card p-4 shadow-sm"
          style={{
            maxWidth: "400px",
            width: "100%",
            background: "#ffffff",
            borderRadius: "8px",
          }}
        >
          {/* Email field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <span className="text-danger">*</span> User Name
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person" />
              </span>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              <span className="text-danger">*</span> Password
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock" />
              </span>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Show error if there is any */}
          {error && (
            <div className="alert alert-danger py-1">{error}</div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-100"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
