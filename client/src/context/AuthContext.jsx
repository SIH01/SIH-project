import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "disastershield_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function restoreSession(stored) {
      if (!stored) {
        setAuthToken(null);
        setUser(null);
        return;
      }
      try {
        const { token, user: storedUser } = JSON.parse(stored);
        if (!token || !storedUser) throw new Error("Invalid stored session");
        setAuthToken(token);
        setUser(storedUser);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
        setUser(null);
      }
    }

    restoreSession(localStorage.getItem(STORAGE_KEY));
    setLoading(false);

    function handleStorage(event) {
      if (event.key === STORAGE_KEY) restoreSession(event.newValue);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function persist(token, userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: userData }));
    setAuthToken(token);
    setUser(userData);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    persist(data.token, data.user);
    return data.user;
  }

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    persist(data.token, data.user);
    return data.user;
  }

  async function adminLogin(payload) {
    const { data } = await api.post("/auth/admin-login", payload);
    persist(data.token, data.user);
    return data.user;
  }

  async function organizationLogin(payload) {
    const { data } = await api.post("/org/login", payload);
    persist(data.token, data.user);
    return data.user;
  }

  // Organization registration also returns a token — the account works
  // immediately, but stays unverified until an admin approves it.
  async function registerOrganization(payload) {
    const { data } = await api.post("/organizations/register", payload);
    persist(data.token, data.user);
    return { user: data.user, organization: data.organization };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, adminLogin, organizationLogin, registerOrganization, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
