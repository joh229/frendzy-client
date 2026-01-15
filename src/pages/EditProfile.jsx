// src/pages/EditProfile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const AUTH_API = "http://localhost:5000/api/auth";

  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png";

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // important: null, not ""

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

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  const updateProfile = async () => {
    if (!username.trim()) {
      return alert("Username cannot be empty");
    }

    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("username", username);
    formData.append("bio", bio);
    if (image) formData.append("image", image);

    try {
      const res = await axios.put(`${AUTH_API}/update-profile`, formData);

      if (res.data.success) {
        // Update localStorage
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
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Edit Profile</h2>

        {/* ================= PROFILE IMAGE ================= */}
        <div className="image-section">
          {preview && <img src={preview} alt="Profile" />}
          <label className="upload-btn">
            Change Photo
            <input type="file" hidden onChange={handleImageChange} />
          </label>
        </div>

        {/* ================= USERNAME ================= */}
        <div className="form-group">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        {/* ================= BIO ================= */}
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about you..."
            maxLength={150}
          />
          <small>{bio.length}/150</small>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="edit-actions">
          <button className="save-btn" onClick={updateProfile}>
            Save Changes
          </button>
          <button className="cancel-btn" onClick={() => navigate("/profile")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}