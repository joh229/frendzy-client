// src/pages/Home.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [showReplyThread, setShowReplyThread] = useState({});

  /* ================= SCROLL FIX ================= */
  const scrollRef = useRef(0);

  const saveScroll = () => {
    scrollRef.current = window.scrollY;
  };

  useLayoutEffect(() => {
    window.scrollTo(0, scrollRef.current);
  }, [posts]);

  /* ================= MENTION FORMAT ================= */
  const formatMentions = (text) => {
    if (!text) return "";
    const mentionRegex = /@(\w+)/g;
    return text.replace(
      mentionRegex,
      `<span class="text-indigo-400 font-semibold">@$1</span>`
    );
  };

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

    saveScroll();

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
      await fetchPosts();
    } catch (err) {
      console.error("CREATE POST ERROR:", err);
    }
  };

  /* ================= POST LIKE ================= */
  const likePost = async (postId) => {
    saveScroll();
    try {
      await API.put(`${POST_API}/like/${postId}`, {
        userId: user._id,
        username: user.username,
      });
      await fetchPosts();
    } catch (err) {
      console.error("LIKE POST ERROR:", err);
    }
  };

  /* ================= COMMENT ================= */
  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    saveScroll();

    try {
      await API.post(`${POST_API}/comment/${postId}`, {
        userId: user._id,
        username: user.username,
        text: commentText[postId],
      });
      setCommentText({ ...commentText, [postId]: "" });
      await fetchPosts();
    } catch (err) {
      console.error("ADD COMMENT ERROR:", err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    saveScroll();
    try {
      await API.delete(`${POST_API}/comment/${postId}/${commentId}`);
      await fetchPosts();
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
    }
  };

  const likeComment = async (postId, commentId) => {
    saveScroll();
    try {
      await API.put(`${POST_API}/comment/like/${postId}/${commentId}`, {
        userId: user._id,
      });
      await fetchPosts();
    } catch (err) {
      console.error("LIKE COMMENT ERROR:", err);
    }
  };

  /* ================= REPLY ================= */
  const addReply = async (postId, commentId, text) => {
    if (!text?.trim()) return;
    saveScroll();

    try {
      await API.post(`${POST_API}/reply/${postId}/${commentId}`, {
        userId: user._id,
        username: user.username,
        text,
      });
      setReplyText({ ...replyText, [commentId]: "" });
      setThreadText({});
      await fetchPosts();
    } catch (err) {
      console.error("ADD REPLY ERROR:", err);
    }
  };

  const deleteReply = async (postId, commentId, replyId) => {
    saveScroll();
    try {
      await API.delete(
        `${POST_API}/reply/delete/${postId}/${commentId}/${replyId}`
      );
      await fetchPosts();
    } catch (err) {
      console.error("DELETE REPLY ERROR:", err);
    }
  };

  const likeReply = async (postId, commentId, replyId) => {
    saveScroll();
    try {
      await API.put(
        `${POST_API}/reply/like/${postId}/${commentId}/${replyId}`,
        { userId: user._id }
      );
      await fetchPosts();
    } catch (err) {
      console.error("LIKE REPLY ERROR:", err);
    }
  };

  if (loading)
    return (
      <h3 className="text-center text-white mt-10 text-xl">Loading...</h3>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-950 text-white px-3 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center py-4 sticky top-0 bg-black/50 backdrop-blur-md z-50 border-b border-white/10">
        <h2 className="text-xl font-bold text-indigo-400">Friendzy</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-4 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-1 rounded-full bg-red-600 hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CREATE POST */}
      <div className="bg-slate-800/80 p-4 rounded-2xl shadow-xl mb-6 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={user?.profilePic?.url}
            alt=""
          />
          <b className="text-indigo-300">{user.username}</b>
        </div>

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-700/70 rounded-xl p-3 text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500"
        />

        {preview && (
          <div className="mt-3 rounded-xl overflow-hidden bg-black shadow-lg border border-white/10">
            {image?.type?.startsWith("video") ? (
              <video
                src={preview}
                controls
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <label className="cursor-pointer text-indigo-400 hover:text-indigo-300">
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
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-md transition"
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
            className="bg-slate-800/80 p-4 rounded-2xl mb-6 shadow-xl border border-white/10"
          >
            <h4 className="font-semibold text-indigo-400">@{post.username}</h4>
            <p className="text-sm mt-1">{post.content}</p>

            {imageUrl && (
              <div className="w-full mt-2 rounded-xl overflow-hidden bg-black shadow-lg">
                <img
                  src={imageUrl}
                  alt="post"
                  className="w-full max-h-[70vh] object-contain rounded-xl"
                />
              </div>
            )}

            {/* POST ACTIONS */}
            <div className="flex gap-3 mt-2 text-sm">
              <button
                type="button"
                onClick={() => likePost(post._id)}
                className="text-pink-400 hover:text-pink-300"
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
                className="text-indigo-400 hover:text-indigo-300"
              >
                Who liked?
              </button>
            </div>

            {showPostLikes[post._id] && (
              <div className="bg-black/60 p-2 rounded-xl mt-2 text-xs">
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
                className="flex-1 bg-slate-700/70 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => addComment(post._id)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition"
              >
                Send
              </button>
            </div>

            {/* COMMENTS */}
            {post.comments.map((c) => (
              <div
                key={c._id}
                className="bg-slate-700/70 p-3 rounded-xl mt-3 border border-white/10"
              >
                {/* everything below remains unchanged */}
                {/* same as your original */}
              </div>
            ))}
            {post.comments.map((c) => (
              <div
                key={c._id}
                className="bg-slate-700/70 p-3 rounded-xl mt-3 border border-white/10"
              >
                {/* Comment */}
                <p className="text-indigo-300 font-semibold">@{c.username}</p>
                <p
                  className="text-sm mt-1"
                  dangerouslySetInnerHTML={{ __html: formatMentions(c.text) }}
                />

                {/* Comment Actions */}
                <div className="flex gap-3 text-xs mt-2">
                  <button
                    type="button"
                    onClick={() => likeComment(post._id, c._id)}
                    className="text-pink-400 hover:text-pink-300"
                  >
                    ❤️ {c.likes?.length || 0}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setThreadText({
                        ...threadText,
                        [c._id]: !threadText[c._id],
                      })
                    }
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Reply
                  </button>

                  {c.userId === user._id && (
                    <button
                      type="button"
                      onClick={() => deleteComment(post._id, c._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {threadText[c._id] && (
                  <div className="flex gap-2 mt-2">
                    <input
                      placeholder="Write a reply..."
                      value={replyText[c._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [c._id]: e.target.value,
                        })
                      }
                      className="flex-1 bg-slate-800 rounded-xl px-3 py-1 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        addReply(post._id, c._id, replyText[c._id])
                      }
                      className="bg-indigo-600 px-3 py-1 rounded-xl text-xs"
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* Replies */}
                {c.replies?.map((r) => (
                  <div
                    key={r._id}
                    className="ml-6 mt-3 bg-slate-800/70 p-2 rounded-xl border border-white/10"
                  >
                    <p className="text-indigo-300 text-sm font-semibold">
                      @{r.username}
                    </p>

                    <p
                      className="text-xs mt-1"
                      dangerouslySetInnerHTML={{ __html: formatMentions(r.text) }}
                    />

                    {/* Reply Actions */}
                    {/* Reply Actions */}
                    <div className="flex gap-3 text-[10px] mt-1">
                      <button
                        type="button"
                        onClick={() => likeReply(post._id, c._id, r._id)}
                        className="text-pink-400 hover:text-pink-300"
                      >
                        ❤️ {r.likes?.length || 0}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowReplyThread({
                            ...showReplyThread,
                            [r._id]: !showReplyThread[r._id],
                          })
                        }
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Reply
                      </button>

                      {r.userId === user._id && (
                        <button
                          type="button"
                          onClick={() => deleteReply(post._id, c._id, r._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Reply to Reply Input */}
                    {showReplyThread[r._id] && (
                      <div className="flex gap-2 mt-2 ml-4">
                        <input
                          placeholder={`Reply to @${r.username}...`}
                          value={replyText[r._id] || ""}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [r._id]: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-900 rounded-xl px-3 py-1 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => addReply(post._id, c._id, replyText[r._id])}
                          className="bg-indigo-600 px-3 py-1 rounded-xl text-[10px]"
                        >
                          Send
                        </button>
                      </div>
                    )}
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