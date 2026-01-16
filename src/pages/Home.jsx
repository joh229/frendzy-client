// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const POST_API = "/posts";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [threadText, setThreadText] = useState({});

  const [showCommentLikes, setShowCommentLikes] = useState({});
  const [showReplyLikes, setShowReplyLikes] = useState({});
  const [showPostLikes, setShowPostLikes] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get(POST_API);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (!file) return setPreview(null);
    setPreview(URL.createObjectURL(file));
  };

  const createPost = async () => {
    if (!content.trim() && !image) return alert("Write something or select media");

    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("username", user.username);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await API.post(`${POST_API}/create`, formData);
      setContent("");
      setImage(null);
      setPreview(null);
      fetchPosts();
    } catch (err) {
      console.error("CREATE POST ERROR:", err);
    }
  };

  const likePost = async (postId) => {
    const scrollY = window.scrollY;
    try {
      await API.put(`${POST_API}/like/${postId}`, {
        userId: user._id,
        username: user.username,
      });
      await fetchPosts();
      window.scrollTo(0, scrollY);
    } catch (err) {
      console.error("LIKE POST ERROR:", err);
    }
  };

  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      await API.post(`${POST_API}/comment/${postId}`, {
        userId: user._id,
        username: user.username,
        text: commentText[postId],
      });
      setCommentText({ ...commentText, [postId]: "" });
      fetchPosts();
    } catch (err) {
      console.error("ADD COMMENT ERROR:", err);
    }
  };

  const likeComment = async (postId, commentId) => {
    const scrollY = window.scrollY;
    try {
      await API.put(`${POST_API}/comment/like/${postId}/${commentId}`, {
        userId: user._id,
      });
      await fetchPosts();
      window.scrollTo(0, scrollY);
    } catch (err) {
      console.error("LIKE COMMENT ERROR:", err);
    }
  };

  if (loading) {
    return <h3 className="text-center text-white mt-10 text-xl">Loading...</h3>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white px-2 sm:px-4 pb-24">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto flex justify-between items-center py-4">
        <h2 className="text-lg sm:text-xl font-bold">Friendzy</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="px-3 sm:px-4 py-1 rounded-full bg-indigo-600 text-sm"
          >
            Profile
          </button>
          <button
            onClick={logout}
            className="px-3 sm:px-4 py-1 rounded-full bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-3xl mx-auto">
        {/* CREATE POST */}
        <div className="bg-slate-800 p-3 sm:p-4 rounded-xl shadow-lg mb-5">
          <div className="flex items-center gap-2 mb-2">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={user?.profilePic?.url}
              alt=""
            />
            <b className="text-sm sm:text-base">{user.username}</b>
          </div>

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-700 rounded-lg p-3 text-sm sm:text-base outline-none resize-none"
          />

          {preview && (
            <div className="mt-3 rounded-lg overflow-hidden bg-black flex justify-center">
              {image?.type?.startsWith("video") ? (
                <video
                  src={preview}
                  controls
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer text-indigo-400 text-sm">
              📷 Add Media
              <input type="file" hidden accept="image/*,video/*" onChange={handleFileChange} />
            </label>
            <button
              onClick={createPost}
              className="px-4 sm:px-5 py-2 bg-indigo-600 rounded-full text-sm"
            >
              Publish
            </button>
          </div>
        </div>

        {/* POSTS */}
        {posts.map((post) => {
          const imageUrl =
            post.image?.url ||
            post.image?.secure_url ||
            post.image?.path ||
            "";

          return (
            <div key={post._id} className="bg-slate-800 p-3 sm:p-4 rounded-xl mb-5 shadow-md">
              <h4 className="font-semibold text-sm sm:text-base">@{post.username}</h4>
              <p className="text-sm mt-1">{post.content}</p>

              {imageUrl && (
                <div className="w-full mt-2 rounded-lg overflow-hidden bg-black flex justify-center">
                  <img
                    src={imageUrl}
                    alt="post"
                    className="w-full max-h-[70vh] object-contain"
                  />
                </div>
              )}

              <div className="flex gap-4 mt-2 text-sm">
                <button onClick={() => likePost(post._id)} className="text-pink-400">
                  ❤️ {post.likes?.length || 0}
                </button>
                <button
                  onClick={() =>
                    setShowPostLikes({
                      ...showPostLikes,
                      [post._id]: !showPostLikes[post._id],
                    })
                  }
                  className="text-indigo-400"
                >
                  Who liked?
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}