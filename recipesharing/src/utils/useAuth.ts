"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeAuth,
  getAuthSnapshot,
  type AuthSnapshot,
} from "./auth";

// ✅ cached server snapshot (stable reference)
const SERVER_SNAPSHOT: AuthSnapshot = { token: null, user: null };

export function useAuth() {
  const snap = useSyncExternalStore<AuthSnapshot>(
    subscribeAuth,
    getAuthSnapshot,         // ✅ cached snapshot
    () => SERVER_SNAPSHOT    // ✅ cached server snapshot
  );

  return {
    token: snap.token,
    user: snap.user,
    loggedIn: !!snap.token,
  };
}
