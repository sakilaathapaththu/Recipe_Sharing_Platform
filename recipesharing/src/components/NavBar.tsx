"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuth } from "@/utils/auth";
import { useAuth } from "@/utils/useAuth";

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { loggedIn, user } = useAuth();

  // Hide navbar on login/register pages
  if (isAuthPage(pathname)) return null;

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20">
      {/* glass background */}
      <div className="border-b border-black/10 bg-white/70 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl px-2 py-1 text-sm font-black tracking-tight text-zinc-900 transition hover:bg-black/5"
            >
             
              RecipeShare
            </Link>

            
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {loggedIn && user ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  title="Go to profile"
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-xl border border-black/10 bg-white text-xs font-black text-zinc-700">
                    {user.username?.slice(0, 1)?.toUpperCase() || "U"}
                  </span>
                  <span className="max-w-[140px] truncate">{user.username}</span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-black"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
