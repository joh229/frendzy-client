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

  /* ================= FETCH POSTS ================= */
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

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= CREATE POST ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const createPost = async () => {
    if (!content.trim() && !image) {
      return alert("Write something or select an image/video");
    }

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

  /* ================= POST LIKE ================= */
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

  /* ================= COMMENT ================= */
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

  const deleteComment = async (postId, commentId) => {
    try {
      await API.delete(`${POST_API}/comment/${postId}/${commentId}`);
      fetchPosts();
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
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

  /* ================= REPLY ================= */
  const addReply = async (postId, commentId, text) => {
    if (!text.trim()) return;

    try {
      await API.post(`${POST_API}/reply/${postId}/${commentId}`, {
        userId: user._id,
        username: user.username,
        text,
      });
      fetchPosts();
    } catch (err) {
      console.error("ADD REPLY ERROR:", err);
    }
  };

  const deleteReply = async (postId, commentId, replyId) => {
    try {
      await API.delete(
        `${POST_API}/reply/delete/${postId}/${commentId}/${replyId}`
      );
      fetchPosts();
    } catch (err) {
      console.error("DELETE REPLY ERROR:", err);
    }
  };

  const likeReply = async (postId, commentId, replyId) => {
    const scrollY = window.scrollY;
    try {
      await API.put(
        `${POST_API}/reply/like/${postId}/${commentId}/${replyId}`,
        { userId: user._id }
      );
      await fetchPosts();
      window.scrollTo(0, scrollY);
    } catch (err) {
      console.error("LIKE REPLY ERROR:", err);
    }
  };

  if (loading)
    return (
      <h3 className="text-center text-white mt-10 text-xl">Loading...</h3>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white px-3 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center py-4">
        <h2 className="text-xl font-bold">Friendzy</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-4 py-1 rounded-full bg-indigo-600"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-1 rounded-full bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CREATE POST */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-lg mb-5">
        <div className="flex items-center gap-2 mb-2">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={user?.profilePic?.url}
            alt=""
          />
          <b>{user.username}</b>
        </div>

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-700 rounded-lg p-3 text-white outline-none resize-none"
        />

        {/* PREVIEW IMAGE / VIDEO */}
        {preview && (
          <div className="mt-3 rounded-lg overflow-hidden bg-black">
            {image?.type?.startsWith("video") ? (
              <video
                src={preview}
                controls
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <label className="cursor-pointer text-indigo-400">
            📷 Add Media
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="button"
            onClick={createPost}
            className="px-5 py-2 bg-indigo-600 rounded-full"
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
          <div
            key={post._id}
            className="bg-slate-800 p-4 rounded-xl mb-5 shadow-md"
          >
            <h4 className="font-semibold">@{post.username}</h4>
            <p className="text-sm mt-1">{post.content}</p>

            {/* POST IMAGE WITH INSTAGRAM STYLE SIZE */}
            {imageUrl && (
              <div className="w-full mt-2 rounded-lg overflow-hidden bg-black">
                <img
                  src={imageUrl}
                  alt="post"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            )}

            {/* POST ACTIONS */}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => likePost(post._id)}
                className="text-pink-400"
              >
                ❤️ {post.likes?.length || 0}
              </button>

              <button
                type="button"
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

            {showPostLikes[post._id] && (
              <div className="bg-black/40 p-2 rounded-lg mt-2 text-sm">
                {post.likes.map((u, i) => (
                  <span key={i} className="block">
                    @{u.username}
                  </span>
                ))}
              </div>
            )}

            {/* COMMENT INPUT */}
            <div className="flex gap-2 mt-3">
              <input
                placeholder="Write a comment..."
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText({
                    ...commentText,
                    [post._id]: e.target.value,
                  })
                }
                className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={() => addComment(post._id)}
                className="bg-indigo-600 px-3 py-2 rounded-lg"
              >
                Send
              </button>
            </div>

            {/* COMMENTS */}
            {post.comments.map((c) => (
              <div key={c._id} className="bg-slate-700 p-2 rounded-lg mt-2">
                <b>@{c.username}</b>
                <p className="text-sm">{c.text}</p>

                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => likeComment(post._id, c._id)}
                    className="text-pink-400 text-sm"
                  >
                    ❤️ {c.likes?.length || 0}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCommentLikes({
                        ...showCommentLikes,
                        [c._id]: !showCommentLikes[c._id],
                      })
                    }
                    className="text-indigo-400 text-sm"
                  >
                    Who liked?
                  </button>
                </div>

                {showCommentLikes[c._id] && (
                  <div className="bg-black/40 p-2 rounded-lg mt-2 text-sm">
                    {c.likes.map((u, i) => (
                      <span key={i}>{u}</span>
                    ))}
                  </div>
                )}

                {/* REPLIES */}
                {c.replies.map((r) => (
                  <div
                    key={r._id}
                    className="ml-4 bg-slate-600 p-2 rounded-lg mt-2"
                  >
                    <b>@{r.username}</b>
                    <p className="text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}