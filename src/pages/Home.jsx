// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
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
  const [showPostLikes, setShowPostLikes] = useState({}); // 🔥 Added

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

  if (loading) return <h3 className="center">Loading...</h3>;

  return (
    <div className="home-container">
      {/* HEADER */}
      <div className="home-header">
        <h2>Friendzy</h2>
        <div>
          <button type="button" onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* CREATE POST */}
      <div className="create-post">
        <div className="create-post-header">
          <div className="create-avatar">
            <img className="avatar" src={user?.profilePic?.url} alt="" />
          </div>
          <div className="create-user-info">
            <b>{user.username}</b>
          </div>
        </div>

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {preview && (
          <div className="preview-box">
            {image?.type?.startsWith("video") ? (
              <video src={preview} controls />
            ) : (
              <img src={preview} alt="preview" />
            )}
          </div>
        )}

        <div className="create-actions">
          <label className="upload-btn">
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
            className="publish-btn"
            onClick={createPost}
          >
            Publish Post
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
          <div key={post._id} className="post-card">
            <h4>@{post.username}</h4>
            <p>{post.content}</p>

            {imageUrl && (
              <img
                src={imageUrl}
                className="post-image"
                alt="post"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            {/* 🔥 POST ACTIONS */}
            <div className="post-actions">
              <button
                type="button"
                onClick={() => likePost(post._id)}
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
              >
                Who liked?
              </button>
            </div>

            {showPostLikes[post._id] && (
              <div className="likes-box">
                {post.likes.map((u, i) => (
                  <span key={i}>@{u.username}</span>
                ))}
              </div>
            )}

            {/* COMMENT INPUT */}
            <div className="comment-box">
              <input
                placeholder="Write a comment..."
                value={commentText[post._id] || ""}
                onChange={(e) =>
                  setCommentText({
                    ...commentText,
                    [post._id]: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => addComment(post._id)}
              >
                Comment
              </button>
            </div>

            {/* COMMENTS */}
            {post.comments.map((c) => (
              <div key={c._id} className="comment">
                <b>@{c.username}</b>
                <p>{c.text}</p>

                <button
                  type="button"
                  onClick={() => likeComment(post._id, c._id)}
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
                >
                  Who liked?
                </button>

                {showCommentLikes[c._id] && (
                  <div className="likes-box">
                    {c.likes.map((u, i) => (
                      <span key={i}>{u}</span>
                    ))}
                  </div>
                )}

                {c.userId === user._id && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteComment(post._id, c._id)}
                  >
                    Delete
                  </button>
                )}

                {/* REPLY INPUT */}
                <div className="reply-box">
                  <input
                    placeholder="Write a reply..."
                    value={replyText[c._id] || ""}
                    onChange={(e) =>
                      setReplyText({
                        ...replyText,
                        [c._id]: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const msg = replyText[c._id];
                      if (!msg?.trim()) return;
                      addReply(post._id, c._id, msg);
                      setReplyText({
                        ...replyText,
                        [c._id]: "",
                      });
                    }}
                  >
                    Reply
                  </button>
                </div>

                {/* REPLIES */}
                {c.replies.map((r) => (
                  <div key={r._id} className="reply">
                    <b>@{r.username}</b>
                    <p>{r.text}</p>

                    <button
                      type="button"
                      onClick={() =>
                        likeReply(post._id, c._id, r._id)
                      }
                    >
                      ❤️ {r.likes?.length || 0}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowReplyLikes({
                          ...showReplyLikes,
                          [r._id]: !showReplyLikes[r._id],
                        })
                      }
                    >
                      Who liked?
                    </button>

                    {showReplyLikes[r._id] && (
                      <div className="likes-box">
                        {r.likes.map((u, i) => (
                          <span key={i}>{u}</span>
                        ))}
                      </div>
                    )}

                    {r.userId === user._id && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          deleteReply(post._id, c._id, r._id)
                        }
                      >
                        Delete
                      </button>
                    )}

                    {/* THREAD REPLY */}
                    <div className="thread-reply-box">
                      <input
                        placeholder={`Reply to @${r.username}...`}
                        value={threadText[r._id] || ""}
                        onChange={(e) =>
                          setThreadText({
                            ...threadText,
                            [r._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const msg = threadText[r._id];
                          if (!msg?.trim()) return;
                          const text = `@${r.username} ${msg}`;
                          addReply(post._id, c._id, text);
                          setThreadText({
                            ...threadText,
                            [r._id]: "",
                          });
                        }}
                      >
                        Reply
                      </button>
                    </div>
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