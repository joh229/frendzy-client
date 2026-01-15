// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setLoading(false);
  }, [location]); // 🔥 Runs whenever route changes

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  }

  return (
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
    </Routes>
  );
}