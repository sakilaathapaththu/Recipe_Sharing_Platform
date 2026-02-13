"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { apiFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import type { User } from "@/utils/auth";

type RegisterRes = { message: string; token: string; user: User };

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Register failed";
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-900"
      aria-hidden="true"
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canSubmit = useMemo(() => {
    return (
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      !loading
    );
  }, [username, email, password, loading]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("bio", bio);
      if (file) fd.append("profile_image", file);

      await apiFetch<RegisterRes>("/api/auth/register", {
        method: "POST",
        body: fd,
      });

      setOk("Registered! Now login...");
      setTimeout(() => router.push("/login"), 600);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100dvh-96px)] overflow-hidden">
      {/* Light background (same style as login) */}
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
              Create your account
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-700">
              save recipes, post your own, and manage your
              profile.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                Profile Image
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                Bio
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                Secure
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-7">
            

            <div className="mt-4 md:mt-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-900">
                    Create account
                  </h2>
                  <p className="mt-1 text-sm text-zinc-700">
                    Fill the details below to register.
                  </p>
                </div>

              
              </div>

              {err && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
                  {err}
                </div>
              )}
              {ok && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                  {ok}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                {/* Username */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g., saki"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                  />
                </div>

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
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-fuchsia-200/70"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Bio / description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell something about you..."
                    className="min-h-[96px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                  />
                </div>

                {/* Profile picture */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Profile picture
                  </label>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-xl file:border file:border-black/10 file:bg-zinc-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-zinc-800 hover:file:bg-zinc-100"
                    />
                  </div>

                  {file && (
                    <p className="mt-2 text-xs text-zinc-600">
                      Selected:{" "}
                      <span className="font-semibold text-zinc-900">
                        {file.name}
                      </span>
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  disabled={!canSubmit}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Creating...
                    </>
                  ) : (
                    <>
                      Register
                      <span className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-zinc-700">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-extrabold text-zinc-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                  >
                    Login
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
