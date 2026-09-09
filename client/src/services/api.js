import axios from "axios";

// Relative path — works in dev (Vite proxies /api to the backend, see
// vite.config.js) AND once the backend serves the built frontend itself
// (see server/server.js), so a single Cloudflare Tunnel to one port covers
// everything. No tunnel URL ever needs to be hardcoded here.
export const api = axios.create({ baseURL: "/api" });

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
