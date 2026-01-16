// src/pages/Profile.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
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

      const res = await API.get(POST_API);

      let data = [];

      // 🔥 FIX: Protect against wrong response shape
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.posts)) {
        data = res.data.posts;
      } else {
        data = [];
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
    return <h3 style={{ textAlign: "center" }}>Loading profile...</h3>;
  }

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-actions">
          <button className="btn home-btn" onClick={() => navigate("/home")}>
            Home
          </button>
          <button
            className="btn edit-btn"
            onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>
          <button className="btn logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* USER INFO */}
      <div className="profile-card">
        <img
          src={
            user.profilePic?.url ||
            "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png"
          }
          alt="Profile"
          className="profile-avatar"
        />
        <h3>@{user.username}</h3>
        <p>{user.bio || "No bio added yet"}</p>

        <div className="follow-info">
          <span>Followers: {user.followers?.length || 0}</span>
          <span>Following: {user.following?.length || 0}</span>
        </div>
      </div>

      {/* POSTS */}
      <h3 className="my-posts-title">My Posts</h3>

      {myPosts.length === 0 && (
        <p style={{ textAlign: "center" }}>You have no posts yet</p>
      )}

      {myPosts.map((post) => (
        <div key={post._id} className="profile-post-card">
          <p>{post.content}</p>

          {post.image?.url && (
            <img
              src={post.image.url}
              alt="post"
              className="profile-post-image"
            />
          )}

          <div className="profile-post-actions">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>💬 {post.comments?.length || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}