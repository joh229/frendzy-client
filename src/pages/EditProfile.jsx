// src/pages/EditProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const AUTH_API = "/auth";

  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png";

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setPreview(user.profilePic?.url || DEFAULT_AVATAR);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const updateProfile = async () => {
    if (!username.trim()) return alert("Username cannot be empty");

    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("username", username);
    formData.append("bio", bio);
    if (image) formData.append("image", image);

    try {
      const res = await API.put(`${AUTH_API}/update-profile`, formData);
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/profile");
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black pb-20">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-slate-800/80 backdrop-blur-xl p-5 sm:p-8 rounded-2xl shadow-2xl">

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-400 text-center mb-6">
          Edit Profile
        </h2>

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center mb-6">
          {preview && (
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />
          )}

          <label className="mt-4 cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition">
            Change Photo
            <input type="file" hidden onChange={handleImageChange} />
          </label>
        </div>

        {/* USERNAME */}
        <div className="mb-5">
          <label className="block text-slate-300 text-xs sm:text-sm font-semibold mb-1">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition"
          />
        </div>

        {/* BIO */}
        <div className="mb-6">
          <label className="block text-slate-300 text-xs sm:text-sm font-semibold mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about you..."
            maxLength={150}
            rows={4}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition resize-none"
          />
          <small className="text-slate-400 text-xs block text-right mt-1">
            {bio.length}/150
          </small>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={updateProfile}
            className="w-full py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-lg"
          >
            Save Changes
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full py-2.5 sm:py-3 rounded-full bg-slate-700 text-white border border-slate-600"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}