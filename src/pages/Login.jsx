// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (!res.data.success) {
        setError(res.data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save user in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Force page reload so App.jsx reads new user
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-6">
          Friendzy
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/40 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-5">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}