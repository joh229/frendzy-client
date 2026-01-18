// import axios from "axios";
// let BASE_URL = import.meta.env.VITE_BASE_URL


// const API = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// export default API;
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const API = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// export default API;

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

/* ================= FOLLOW SYSTEM ================= */

export const followUser = (userId, targetId) => {
  return API.post("/auth/follow", {
    userId,
    targetId,
  });
};

export const unfollowUser = (userId, targetId) => {
  return API.post("/auth/unfollow", {
    userId,
    targetId,
  });
};

export default API;