import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfiles, createProfile } from "./profilesSlice";

import TimezonePicker from "../../components/TimezonePicker" ;

export default function ProfilesPage() {
  const dispatch = useDispatch();
  const { items, status, error, createStatus } = useSelector(
    (state) => state.profiles
  );
  const auth = useSelector((state) => state.auth);
  const isAdmin = auth?.profile?.role === "admin";

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    dispatch(fetchProfiles());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !timezone) {
      alert("Name and timezone are required");
      return;
    }
    const payload = { name, timezone, email, role };
    const result = await dispatch(createProfile(payload));
    if (createProfile.fulfilled.match(result)) {
      setName("");
      setEmail("");
      setRole("user");
      setTimezone("Asia/Kolkata");
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-title">Profiles</div>
        <div className="page-subtitle">
          Manage system users and their default timezones.
        </div>
      </div>

      {/* Layout */}
      <div className="profiles-layout">
        {/* Left column — Profiles List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Existing Profiles</div>
            {status === "loading" && (
              <div className="card-status">Loading…</div>
            )}
          </div>

          {error && <div className="text-red-600 text-xs">{error}</div>}

          {items.length === 0 && status === "succeeded" ? (
            <p className="text-muted">No profiles yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Timezone</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.email || "-"}</td>
                      <td>{p.role}</td>
                      <td>{p.timezone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column — Create Profile */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: "12px" }}>
            Create New Profile
          </div>

          {isAdmin ? (
            <form onSubmit={handleCreate}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="User name"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Timezone */}
              <TimezonePicker value={timezone} onChange={setTimezone} />

              {/* Submit */}
              <button
                type="submit"
                disabled={createStatus === "loading"}
                className="btn btn-primary btn-full"
                style={{ marginTop: "6px" }}
              >
                {createStatus === "loading" ? "Creating…" : "Create Profile"}
              </button>
            </form>
          ) : (
            <p className="text-muted">Only admins can create profiles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
