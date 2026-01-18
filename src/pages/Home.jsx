// src/pages/Home.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import API from "../api";
import API, { followUser, unfollowUser } from "./api";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const inputRef = useRef(null);
  const [following, setFollowing] = useState([]);

  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
 


  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (storyPreview) URL.revokeObjectURL(storyPreview);
    };
  }, [preview, storyPreview]);



  useEffect(() => {
    if (location.state?.focusPost) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [location]);

  useEffect(() => {
    if (user?.following) {
      setFollowing(user.following);
    }
  }, []);

  useEffect(() => {
    if (activeStory) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeStory]);

  // Get only latest story per user
  const uniqueStories = Object.values(
    stories.reduce((acc, story) => {
      if (
        !acc[story.userId] ||
        new Date(story.createdAt) > new Date(acc[story.userId].createdAt)
      ) {
        acc[story.userId] = story;
      }
      return acc;
    }, {})
  );
// Your own latest story
const myStory = uniqueStories.find(
  (s) => String(s.userId) === String(user._id)
);



  // For story upload
  const handleStoryFileChange = (e) => {
    const file = e.target.files[0];
    setStoryFile(file);

    if (!file) {
      setStoryPreview(null);
      return;
    }

    if (storyPreview) {
      URL.revokeObjectURL(storyPreview);
    }

    const url = URL.createObjectURL(file);
    setStoryPreview(url);
  };

  // ADD THIS RIGHT AFTER ↑
  const uploadStory = async () => {
    if (!storyFile) return alert("Select a story first");

    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("username", user.username);   // 🔥 REQUIRED
    formData.append("image", storyFile);

    try {
      await API.post("/stories/create", formData);
      setStoryFile(null);
      setStoryPreview(null);
      fetchStories();                              // 🔥 Refresh stories after upload
      alert("Story uploaded successfully");
    } catch (err) {
      console.error("STORY UPLOAD ERROR:", err.response?.data || err);
    }
  };


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
    fetchStories();
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
  /* ================= FETCH STORIES ================= */
  const fetchStories = async () => {
    try {
      const res = await API.get("/stories");
      setStories(res.data.stories || []);
    } catch (err) {
      console.error("FETCH STORIES ERROR:", err);
    }
  };

  /* ================= STORY LIKE ================= */
  const likeStory = async (storyId) => {
    try {
      const res = await API.put(`/stories/like/${storyId}`, {
        userId: user._id,
      });

      // 🔥 Update the currently open story
      setActiveStory((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));

      // 🔁 Refresh story list also
      fetchStories();
    } catch (err) {
      console.error("LIKE STORY ERROR:", err);
    }
  };

  /* ================= STORY DELETE ================= */
  const deleteStory = async (storyId) => {
    if (!window.confirm("Delete this story?")) return;

    try {
      await API.delete(`/stories/delete/${storyId}`);
      setActiveStory(null);
      fetchStories();
    } catch (err) {
      console.error("DELETE STORY ERROR:", err);
    }
  };





  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= FOLLOW SYSTEM ================= */

  const handleFollow = async (targetUserId) => {
    try {
      const res = await API.post("/users/follow", {
        userId: user._id,
        targetId: targetUserId
      });

      setFollowing(res.data.following);

      const updatedUser = {
        ...user,
        following: res.data.following,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("FOLLOW ERROR:", err);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      const res = await API.post("/users/unfollow", {
        userId: user._id,
        targetId: targetUserId
      });

      setFollowing(res.data.following);

      const updatedUser = {
        ...user,
        following: res.data.following,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("UNFOLLOW ERROR:", err);
    }
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

      // focus again after posting
      inputRef.current?.focus();

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
      </div>

      {/* ===== STORIES BAR ===== */}
      <div className="flex gap-4 overflow-x-auto py-3 px-2">

        {/* Your Story */}
        <div
          className="flex flex-col items-center shrink-0 cursor-pointer"
          onClick={() => {
            if (!myStory) {
              alert("You have no story yet");
              return;
            }
            setActiveStory(myStory);
          }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">

                {myStory?.media?.resource_type === "video" ? (
                  <video
                    src={myStory.media.url}
                    className="w-full h-full object-cover rounded-full"
                    muted
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={myStory?.media?.url || user?.profilePic?.url || "/default-avatar.png"}
                    className="w-full h-full rounded-full object-cover"
                    alt="story"
                  />
                )}

              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-black">
              <span className="text-xs font-bold">+</span>
            </div>
          </div>

          <p className="text-xs mt-1 text-gray-300">Your story</p>
        </div>

        {uniqueStories
          ?.filter(story => String(story.userId) !== String(user._id))
          .map((story) => (
            <div key={story._id} onClick={() => setActiveStory(story)}
              className="flex flex-col items-center shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">

                  {story.media?.resource_type === "video" ? (
                    <video
                      src={story.media.url}
                      className="w-full h-full object-cover rounded-full"
                      muted
                      autoPlay
                      loop
                    />
                  ) : (
                    <img
                      src={story.media.url}
                      className="w-full h-full object-cover rounded-full"
                      alt="story"
                    />
                  )}

                </div>
              </div>

              <p className="text-xs mt-1 text-gray-300 w-16 truncate text-center">
                {story.username}
              </p>
            </div>
          ))}
      </div>




      {/* STORY UPLOAD */}
      <div className="bg-slate-800/70 p-3 rounded-xl mb-4 border border-white/10">
        <label className="cursor-pointer text-indigo-400">
          ➕ Add Story
          <input
            type="file"
            hidden
            accept="image/*,video/*"
            onChange={handleStoryFileChange}
          />
        </label>

        {storyPreview && (
          <div className="mt-2 rounded-lg overflow-hidden">
            {storyFile?.type?.startsWith("video") ? (
              <video
                src={storyPreview}
                controls
                className="w-full max-h-[50vh] object-contain rounded-lg"
              />
            ) : (
              <img
                src={storyPreview}
                className="w-full max-h-[50vh] object-contain rounded-lg"
                alt="story preview"
              />
            )}
          </div>
        )}

        {storyPreview && (
          <button
            onClick={uploadStory}
            className="mt-2 px-4 py-1 bg-indigo-600 rounded-full"
          >
            Upload Story
          </button>
        )}
      </div>


      {activeStory && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">

          {/* Close */}
          <button
            onClick={() => setActiveStory(null)}
            className="absolute top-4 right-4 text-white text-3xl z-[10001]"
          >
            ✕
          </button>

          {/* Story box */}
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-xl overflow-hidden z-[10000]">

            {/* Media */}
            {activeStory.media.resource_type === "video" ? (
              <video
                src={activeStory.media.url}
                autoPlay
                muted
                loop
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={activeStory.media.url}
                alt="story"
                className="w-full h-full object-contain"
              />
            )}

            <div className="absolute bottom-0 left-0 w-full px-4 py-3 
             bg-gradient-to-t from-black/90 to-transparent 
                 flex justify-between items-center 
                  z-[10001] pointer-events-auto">

              <div className="flex items-center gap-2">
                <button
                  className="text-white text-2xl"
                  onClick={() => likeStory(activeStory._id)}
                >
                  ❤️
                </button>
                <span className="text-white text-sm">
                  {activeStory.likes?.length || 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className="text-white text-2xl"
                  onClick={() => {
                    navigator.clipboard.writeText(activeStory.media.url);
                  }}
                >
                  🔗
                </button>

                {String(activeStory.userId) === String(user._id) && (
                  <button
                    className="text-red-500 text-2xl"
                    onClick={() => deleteStory(activeStory._id)}
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}





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
          ref={inputRef}
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
      {
        posts.map((post) => {
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
              <div className="flex items-center  mb-3">
                <div className="flex items-center gap-3">
                  <Link to={`/user/${post.userId}`}>
                    <img
                      src="/default-avatar.png"
                      alt="user"
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                  </Link>



                  <div className="flex flex-col leading-tight">
                    <Link
                      to={`/user/${post.userId}`}
                      className="text-sm font-semibold text-indigo-400"
                    >
                      @{post.username || "Unknown"}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {post.userId !== user._id && (
                  following.includes(post.userId) ? (
                    <button
                      onClick={() => handleUnfollow(post.userId)}
                      className="
      ml-4
        px-5 py-[5px]
        text-xs font-medium
        rounded-full
        border border-white/60
        text-white
        bg-transparent
      "
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(post.userId)}
                      className="

      ml-4
        px-5 py-[5px]
        text-xs font-medium
        rounded-full
        border border-white/60
        text-white
        bg-transparent
      "
                    >
                      Follow
                    </button>
                  )
                )}
              </div>
              <p className="text-sm mt-1">{post.content}</p>
              {post.image?.url && (
                <div className="w-full mt-2 rounded-xl overflow-hidden bg-black shadow-lg">
                  {post.image.resource_type === "video" ? (
                    <video
                      src={post.image.url}
                      controls
                      className="w-full max-h-[70vh] object-contain rounded-xl"
                    />
                  ) : (
                    <img
                      src={post.image.url}
                      alt="post"
                      className="w-full max-h-[70vh] object-contain rounded-xl"
                    />
                  )}
                </div>
              )}


              {/* POST ACTIONS */}
              <div className="flex justify-between items-center mt-3 text-sm">
                <div className="flex gap-4 items-center">
                  {/* LIKE */}
                  <button
                    type="button"
                    onClick={() => likePost(post._id)}
                    className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition"
                  >
                    ❤️ <span>{post.likes?.length || 0}</span>
                  </button>

                  {/* WHO LIKED */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPostLikes({
                        ...showPostLikes,
                        [post._id]: !showPostLikes[post._id],
                      })
                    }
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                  >
                    👀 Who liked
                  </button>

                  {/* SHARE */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/post/${post._id}`;
                      navigator.clipboard.writeText(url);
                      alert("Post link copied to clipboard!");
                    }}
                    className="
        flex items-center gap-1
        text-emerald-400
        hover:text-emerald-300
        transition
      "
                  >
                    🔗 Share
                  </button>
                </div>


                {/* DELETE (ONLY OWNER) */}
                {String(post.userId) === String(user._id) && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Are you sure you want to delete this post?")) return;
                      try {
                        await API.delete(`/posts/delete/${post._id}`);
                        fetchPosts();
                      } catch (err) {
                        console.error("DELETE POST ERROR:", err);
                      }
                    }}
                    className="
      flex items-center gap-1
      text-red-400
      hover:text-red-300
      transition
    "
                  >
                    🗑 Delete
                  </button>
                )}
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

                      \
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
        })
      }
    </div >
  );
}