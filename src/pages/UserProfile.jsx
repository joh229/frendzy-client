import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API, { followUser, unfollowUser } from "./api";

export default function UserProfile() {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/auth/profile/${id}`);
      const profileUser = res.data;

      setUser(profileUser);

      if (
        currentUser &&
        profileUser.followers?.includes(currentUser._id)
      ) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      setLoading(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      await followUser(currentUser._id, user._id);
      setIsFollowing(true);

      setUser((prev) => ({
        ...prev,
        followers: [...(prev.followers || []), currentUser._id],
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;

    try {
      await unfollowUser(currentUser._id, user._id);
      setIsFollowing(false);

      setUser((prev) => ({
        ...prev,
        followers:
          prev.followers?.filter((fid) => fid !== currentUser._id) || [],
      }));
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  if (loading)
    return (
      <p className="text-center text-white mt-10 text-lg">Loading...</p>
    );

  if (!user)
    return (
      <p className="text-center text-red-400 mt-10 text-lg">
        User not found
      </p>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 px-3">
      <div className="max-w-3xl mx-auto bg-slate-800/80 rounded-2xl p-5 shadow-xl border border-white/10">

        {/* Profile Top */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={user.profilePic?.url || "/default-avatar.png"}
            alt="profile"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-indigo-500"
          />

          <div className="text-center sm:text-left w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-400">
              @{user.username || "Unknown"}
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              {user.bio || "No bio available"}
            </p>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 mt-3 text-sm">
              <div>
                <span className="font-semibold text-white">
                  {user.followers?.length || 0}
                </span>
                <p className="text-gray-400">Followers</p>
              </div>
              <div>
                <span className="font-semibold text-white">
                  {user.following?.length || 0}
                </span>
                <p className="text-gray-400">Following</p>
              </div>
            </div>

            {/* Follow Button */}
            {currentUser && currentUser._id !== user._id && (
              <div className="mt-4">
                {isFollowing ? (
                  <button
                    onClick={handleUnfollow}
                    className="px-5 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-full text-sm transition"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm transition"
                  >
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/10"></div>

        {/* Posts Section Placeholder */}
        <div className="text-center text-gray-400 text-sm">
          User posts will appear here…
        </div>
      </div>
    </div>
  );
}