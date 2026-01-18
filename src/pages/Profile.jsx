// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await API.get("/posts");

      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.posts)) {
        data = res.data.posts;
      }

      setPosts(data);

      const mine = data.filter(
        (post) => String(post.userId) === String(user._id)
      );

      setMyPosts(mine);
    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
      setPosts([]);
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <h3 className="text-center text-slate-400 mt-10">
        Loading profile...
      </h3>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black px-3 sm:px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
            My Profile
          </h2>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/edit-profile")}
              className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs sm:text-sm font-semibold hover:bg-purple-700 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-600 text-white text-xs sm:text-sm font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* USER INFO */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-5 sm:p-6 text-center mb-8">
          <img
            src={
              user.profilePic?.url ||
              "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png"
            }
            alt="Profile"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full mx-auto object-cover border-4 border-indigo-500 shadow-lg mb-4"
          />

          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
            @{user.username}
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            {user.bio || "No bio added yet"}
          </p>

          <div className="flex justify-center gap-6 mt-4 text-xs sm:text-sm text-slate-300 font-semibold">
            <span>Followers: {user.followers?.length || 0}</span>
            <span>Following: {user.following?.length || 0}</span>
          </div>
        </div>

        {/* POSTS */}
        <h3 className="text-center text-lg sm:text-xl font-bold text-indigo-400 mb-4">
          My Posts
        </h3>

        {myPosts.length === 0 && (
          <p className="text-center text-slate-400">
            You have no posts yet
          </p>
        )}

        <div className="grid gap-4">
          {myPosts.map((post) => (
            <div
              key={post._id}
              className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-4"
            >
              <p className="text-slate-200 text-sm mb-3">
                {post.content}
              </p>

              {/* INSTAGRAM STYLE IMAGE SIZING */}
              {post.image?.url && (
                <div className="w-full rounded-xl overflow-hidden bg-black">
                  <img
                    src={post.image.url}
                    alt="post"
                    className="
                      w-full 
                      max-h-[70vh]
                      object-contain
                      rounded-xl
                    "
                  />
                </div>
              )}

              <div className="flex justify-between mt-3 text-xs sm:text-sm text-slate-300 font-semibold">
                <span>❤️ {post.likes?.length || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}