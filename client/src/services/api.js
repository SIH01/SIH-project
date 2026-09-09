import axios from "axios";

function decodeUtf8Value(value) {
  if (typeof value !== "string") return value;
  if (!/[ÃÂâ€]/.test(value)) return value;
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function decodeUtf8Response(value) {
  if (Array.isArray(value)) return value.map(decodeUtf8Response);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, decodeUtf8Response(entry)]));
  }
  return decodeUtf8Value(value);
}

export const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    Accept: "application/json; charset=utf-8",
  },
  responseType: "json",
});

api.interceptors.response.use((response) => {
  response.data = decodeUtf8Response(response.data);
  return response;
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
