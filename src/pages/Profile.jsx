// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const POST_API = "/posts";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-indigo-400">
            My Profile
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/edit-profile")}
              className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* USER INFO CARD */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-center mb-8">
          <img
            src={
              user.profilePic?.url ||
              "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-indigo-500 shadow-lg mb-4"
          />

          <h3 className="text-lg md:text-xl font-bold text-white">
            @{user.username}
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            {user.bio || "No bio added yet"}
          </p>

          <div className="flex justify-center gap-6 mt-4 text-sm text-slate-300 font-semibold">
            <span>Followers: {user.followers?.length || 0}</span>
            <span>Following: {user.following?.length || 0}</span>
          </div>
        </div>

        {/* POSTS */}
        <h3 className="text-center text-xl font-bold text-indigo-400 mb-4">
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

              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="post"
                  className="w-full max-h-80 object-cover rounded-xl mb-3"
                />
              )}

              <div className="flex justify-between text-sm text-slate-300 font-semibold">
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