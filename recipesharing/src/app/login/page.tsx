"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import { setAuth, type User } from "@/utils/auth";

type LoginRes = { message: string; token: string; user: User };

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Login failed";
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 1 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("email", email.trim());
      fd.append("password", password);

      const data = await apiFetch<LoginRes>("/api/auth/login", {
        method: "POST",
        body: fd,
      });

      setAuth(data.token, data.user);
      router.push("/");
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100dvh-96px)] overflow-hidden">
      {/* Light background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-96px)] w-full max-w-6xl items-center justify-center px-4 py-10 md:px-6">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          {/* Left side (brand) */}
          <div className="hidden md:flex md:flex-col md:justify-center">
          

            <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900">
              Welcome back 
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-700">
              Log in to manage your recipes, save favorites, and create new
              delicious posts.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
             
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-7">
            <div className="md:hidden">
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Welcome back 
              </h1>
              <p className="mt-1 text-sm text-zinc-700">Sign in to continue.</p>
            </div>

            <div className="mt-4 md:mt-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-900">
                    Login
                  </h2>
                  <p className="mt-1 text-sm text-zinc-700">
                    Enter your details to sign in.
                  </p>
                </div>

                
              </div>

              {err && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
                  {err}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                      @
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-24 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-fuchsia-200/70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute inset-y-0 right-2 my-2 rounded-xl border border-black/10 bg-white px-3 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-black/20"
                        checked={showPw}
                        onChange={() => setShowPw((s) => !s)}
                      />
                      Show password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-zinc-800 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <button
                  disabled={!canSubmit}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login
                      <span className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-zinc-700">
                  Don’t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-extrabold text-zinc-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                  >
                    Register
                  </Link>
                </p>
              </form>

              <p className="mt-5 text-center text-xs text-zinc-500">
                By continuing, you agree to our{" "}
                <span className="text-zinc-700">Terms</span> and{" "}
                <span className="text-zinc-700">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
