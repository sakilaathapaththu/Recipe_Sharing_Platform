"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loggedIn } = useAuth();

  // ✅ wait until client hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // ✅ only redirect AFTER mounted
    if (mounted && !loggedIn) {
      router.replace("/login");
    }
  }, [mounted, loggedIn, router]);

  // ✅ while hydrating, don't redirect / don't flash
  if (!mounted) return null;

  // ✅ if mounted but not logged in, wait for redirect
  if (!loggedIn) return null;

  return <>{children}</>;
}
