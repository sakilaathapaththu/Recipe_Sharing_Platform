"use client";

export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profile_image?: string | null;
  created_at?: string;
};

export type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

const AUTH_EVENT = "auth_changed";

// ✅ cache fields (module-level)
let lastToken: string | null = null;
let lastUserRaw: string | null = null;
let lastSnapshot: AuthSnapshot = { token: null, user: null };

function safeParseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ✅ IMPORTANT: return SAME object if nothing changed
export function getAuthSnapshot(): AuthSnapshot {
  if (typeof window === "undefined") return lastSnapshot;

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (token === lastToken && userRaw === lastUserRaw) {
    return lastSnapshot; // ✅ same reference
  }

  lastToken = token;
  lastUserRaw = userRaw;

  lastSnapshot = {
    token,
    user: safeParseUser(userRaw),
  };

  return lastSnapshot;
}

export function getToken(): string | null {
  return getAuthSnapshot().token;
}

export function getUser(): User | null {
  return getAuthSnapshot().user;
}

export function setAuth(token: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  // update cache immediately
  lastToken = token;
  lastUserRaw = JSON.stringify(user);
  lastSnapshot = { token, user };

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // update cache immediately
  lastToken = null;
  lastUserRaw = null;
  lastSnapshot = { token: null, user: null };

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuth(cb: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => cb();

  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function setUserOnly(user: User) {
  const token = localStorage.getItem("token");
  if (token) setAuth(token, user); // reuse setAuth to fire event
}
