import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const iconClass = (active) =>
    `
      w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
      ${active ? "text-indigo-400" : "text-white/70"}
      transition-all duration-200
      ${active ? "scale-110 drop-shadow-[0_0_10px_rgba(99,102,241,0.9)]" : ""}
    `;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-6px_30px_rgba(0,0,0,0.8)]">
      <div className="relative flex justify-around items-center py-4">

        {/* Home */}
        <button
          onClick={() => navigate("/home")}
          className={`p-3 rounded-full transition ${
            isActive("/home") ? "bg-indigo-500/10" : ""
          }`}
        >
          <svg
            className={iconClass(isActive("/home"))}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 12l9-9 9 9" />
            <path d="M9 21V9h6v12" />
          </svg>
        </button>

        {/* Create Post (Main Action Button) */}
        <button
          onClick={() => navigate("/home", { state: { focusPost: true } })}
          className="
            absolute -top-10
            w-18 h-18
            rounded-full
            bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700
            flex items-center justify-center
            text-white text-4xl font-bold
            shadow-[0_12px_40px_rgba(99,102,241,0.8)]
            active:scale-95
            transition-all duration-200
            border-4 border-black
          "
        >
          +
        </button>

        {/* Activity */}
        <button
          className="relative p-3 rounded-full transition"
        >
          <svg
            className={iconClass(false)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l4 8-4 4-4-4 4-8z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-md"></span>
        </button>

        {/* Search */}
        <button
          className="p-3 rounded-full transition"
        >
          <svg
            className={iconClass(false)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Profile */}
        <button onClick={() => navigate("/profile")} className="p-2">
          <img
            src={JSON.parse(localStorage.getItem("user"))?.profilePic?.url}
            className={`
              w-11 h-11 sm:w-12 sm:h-12
              rounded-full
              object-cover
              border-2
              transition-all duration-200
              ${
                isActive("/profile")
                  ? "border-indigo-400 scale-110 shadow-[0_0_16px_rgba(99,102,241,0.9)]"
                  : "border-white/20"
              }
            `}
            alt="profile"
          />
        </button>
      </div>
    </div>
  );
}