// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/UserProfile";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setLoading(false);
  }, [location]);

  if (loading) {
    return <h3 className="text-center mt-10">Loading...</h3>;
  }

  // Hide BottomNav on auth pages
  const hideBottomNav =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {/* Page content */}
      <div className="pb-20">
        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={user ? <Navigate to="/home" /> : <Login />}
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={user ? <Navigate to="/home" /> : <Register />}
          />

          {/* ROOT */}
          <Route
            path="/"
            element={<Navigate to={user ? "/home" : "/login"} />}
          />

          {/* HOME */}
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/login" />}
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          {/* EDIT PROFILE */}
          <Route
            path="/edit-profile"
            element={user ? <EditProfile /> : <Navigate to="/login" />}
          />

          {/* USER PROFILE PAGE */}
          <Route
            path="/user/:id"
            element={user ? <UserProfile /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      {!hideBottomNav && <BottomNav />}
    </>
  );
}