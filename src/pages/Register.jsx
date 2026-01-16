// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      });

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      // 🔥 AUTO LOGIN AFTER REGISTER
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect directly to Home
      navigate("/home");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-6">
          Friendyz.in
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition"
          />

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
            className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/40 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-5">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}