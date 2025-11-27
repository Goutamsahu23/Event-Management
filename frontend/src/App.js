// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./features/auth/Login";
import ProfilesPage from "./features/profiles/ProfilesPage";
import EventsPage from "./features/events/EventsPage";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }) {
  const auth = useSelector((state) => state.auth);
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="app-navbar-inner">
          
          {/* Left section */}
          <div className="app-navbar-left">
            <div className="app-logo">EM</div>

            <div className="app-title-group">
              <span className="app-title">Event Management</span>
              {isAuthenticated && user && (
                <span className="app-subtitle">
                  {user.name} · {user.timezone}
                </span>
              )}
            </div>
          </div>

          {/* Right-side navigation */}
          <nav className="app-nav-links">
            {isAuthenticated && (
              <>
                <Link to="/profiles" className="app-nav-link">
                  Profiles
                </Link>
                <Link to="/events" className="app-nav-link">
                  Events
                </Link>
                <button onClick={logout} className="app-logout-btn">
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="app-login-btn">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">{children}</main>
    </div>
  );
}

export default function App() {
  const auth = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Layout>
              {auth.token ? <Navigate to="/events" replace /> : <Login />}
            </Layout>
          }
        />

        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <EventsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            auth.token ? (
              <Navigate to="/profiles" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
