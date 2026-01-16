import axios from "axios";
let BASE_URL = import.meta.env.VITE_BASE_URL


const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export default API;
