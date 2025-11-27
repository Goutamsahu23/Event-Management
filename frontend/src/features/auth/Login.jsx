import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [profileId, setProfileId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !profileId) {
      alert("Enter email or profileId");
      return;
    }

    const payload = {};
    if (email) payload.email = email;
    if (profileId) payload.profileId = profileId;

    const result = await dispatch(login(payload));
    if (login.fulfilled.match(result)) {
      navigate("/events");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          For this assignment, we can log in using a seeded profile ID or email
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input
              type="email"
              className="input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Profile ID */}
          <div className="form-group">
            <label className="form-label">Profile ID (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Mongo _id from seed"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            />
          </div>

          {auth.error && (
            <div className="auth-error">{auth.error}</div>
          )}

          <button
            type="submit"
            disabled={auth.status === "loading"}
            className="btn btn-primary btn-full"
            style={{ marginTop: "10px" }}
          >
            {auth.status === "loading" ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
