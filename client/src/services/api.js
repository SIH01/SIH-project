import axios from "axios";

// In dev, defaults to your local backend. For access from other devices
// (e.g. via a Cloudflare Tunnel), set VITE_API_URL in client/.env to your
// backend's public tunnel URL — see the setup note below.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}