"use client";

import AuthGuard from "@/components/AuthGuard";
import { apiFetch, API_BASE } from "@/utils/api";
import { useAuth } from "@/utils/useAuth";
import { setUserOnly, type User } from "@/utils/auth";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MyRecipe = {
  id: string;
  title: string;
  description?: string;
  cuisine_type?: string;
  difficulty?: string;
  prep_time_min?: number;
  cook_time_min?: number;
  servings?: number;
  created_at?: string;
};

type HistoryItem = {
  id: string;
  recipe_id: string;
  recipe_title: string;
  status: "in_progress" | "completed";
  started_at?: string;
  completed_at?: string | null;
};

type MyRecipesRes = { items: MyRecipe[] };
type HistoryRes = { items: HistoryItem[] };
type MeRes = { user: User };
type UpdateMeRes = { message: string; user: User };

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "Failed";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs text-zinc-700 backdrop-blur">
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-zinc-600">{hint}</div> : null}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  const imageUrl = useMemo(() => {
    if (!user?.profile_image) return null;
    return `${API_BASE}${user.profile_image}`;
  }, [user]);

  // recipes
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [recipes, setRecipes] = useState<MyRecipe[]>([]);

  // cooking history
  const [hLoading, setHLoading] = useState(true);
  const [hErr, setHErr] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // edit profile
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pErr, setPErr] = useState("");
  const [pOk, setPOk] = useState("");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // tabs
  const [tab, setTab] = useState<"recipes" | "history">("recipes");

  async function loadMine() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch<MyRecipesRes>("/api/recipes/mine");
      setRecipes(data.items || []);
    } catch (e: unknown) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHLoading(true);
    setHErr("");
    try {
      const data = await apiFetch<HistoryRes>("/api/cooking/history");
      setHistory(data.items || []);
    } catch (e: unknown) {
      setHErr(errMsg(e));
    } finally {
      setHLoading(false);
    }
  }

  async function refreshMe() {
    const data = await apiFetch<MeRes>("/api/auth/me");
    setUserOnly(data.user);
  }

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || "");
      loadMine();
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function saveProfile() {
    setPErr("");
    setPOk("");
    if (!user) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("bio", bio);
      if (file) fd.append("profile_image", file);

      const data = await apiFetch<UpdateMeRes>("/api/auth/me", {
        method: "PUT",
        body: fd,
      });

      setUserOnly(data.user);

      setPOk("Profile updated!");
      setEditing(false);
      setFile(null);

      loadMine();
      loadHistory();
    } catch (e: unknown) {
      setPErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  const recipesCreated = recipes.length;
  const recipesCooked = history.filter((h) => h.status === "completed").length;

  // ✅ ONLY COMPLETED ITEMS for UI
  const completedHistory = useMemo(
    () => history.filter((h) => h.status === "completed"),
    [history]
  );

  return (
    <AuthGuard>
      <div className="relative overflow-hidden">
        {/* light background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl" />
          <div className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-300/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
              My Profile
            </h2>
            <p className="text-sm text-zinc-700">
              Manage profile settings, view your recipes, and check cooking
              history.
            </p>
          </div>

          {!user ? (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-700">
              No user data. Please login again.
            </div>
          ) : (
            <>
              {/* Profile top card */}
              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt="profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                          No Image
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xl font-black text-zinc-900">
                        {user.username}
                      </div>
                      <div className="text-sm text-zinc-700">{user.email}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge>User ID: {user.id}</Badge>
                        {user.created_at ? (
                          <Badge>
                            Joined:{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                      onClick={() => {
                        setEditing((v) => !v);
                        setPErr("");
                        setPOk("");
                        setUsername(user.username);
                        setBio(user.bio || "");
                        setFile(null);
                      }}
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </button>

                    <button
                      type="button"
                      onClick={refreshMe}
                      className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <StatCard
                    label="Recipes Created"
                    value={recipesCreated}
                    hint="Recipes you posted"
                  />
                  <StatCard
                    label="Recipes Cooked"
                    value={recipesCooked}
                    hint="Completed cooking sessions"
                  />
                </div>

                {/* Bio / Editor */}
                <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5">
                  {!editing ? (
                    <>
                      <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Bio
                      </div>
                      <div className="mt-2 text-sm text-zinc-800">
                        {user.bio?.trim() ? user.bio : "—"}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {pErr && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
                          {pErr}
                        </div>
                      )}
                      {pOk && (
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                          {pOk}
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-800">
                          Username
                        </label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-800">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="min-h-[110px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-800">
                          Profile Picture (optional)
                        </label>
                        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] || null)
                            }
                            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-xl file:border file:border-black/10 file:bg-zinc-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-zinc-800 hover:file:bg-zinc-100"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={saving}
                          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                          <span className="transition group-hover:translate-x-0.5">
                            →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={refreshMe}
                          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                        >
                          Refresh from server
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="rounded-3xl border border-black/10 bg-white/70 p-2 shadow-sm backdrop-blur">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("recipes")}
                    className={
                      tab === "recipes"
                        ? "rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-extrabold text-white"
                        : "rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-white/80"
                    }
                  >
                    My Recipes
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("history")}
                    className={
                      tab === "history"
                        ? "rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-extrabold text-white"
                        : "rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-white/80"
                    }
                  >
                    Cooking History
                  </button>
                </div>
              </div>

              {/* Content */}
              {tab === "history" ? (
                <>
                  {hErr && (
                    <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-700">
                      {hErr}
                    </div>
                  )}
                  {hLoading && (
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 text-sm text-zinc-700 shadow-sm backdrop-blur">
                      Loading history...
                    </div>
                  )}

                  {!hLoading && completedHistory.length === 0 && (
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-6 text-center shadow-sm backdrop-blur">
                      <div className="text-lg font-black text-zinc-900">
                        No completed cooking history yet
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">
                        Complete a recipe to see it here.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedHistory.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur"
                      >
                        <div className="text-base font-extrabold text-zinc-900">
                          {h.recipe_title || "Recipe"}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-700">
                          <Badge>✅ Completed</Badge>
                          <Badge>
                            Started:{" "}
                            {h.started_at
                              ? new Date(h.started_at).toLocaleString()
                              : "—"}
                          </Badge>
                          <Badge>
                            Completed:{" "}
                            {h.completed_at
                              ? new Date(h.completed_at).toLocaleString()
                              : "—"}
                          </Badge>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Link
                            href={`/recipes/${h.recipe_id}`}
                            className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
                          >
                            View Recipe
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">
                        My Recipes
                      </h3>
                      <p className="text-sm text-zinc-700">
                        Manage your created recipes.
                      </p>
                    </div>

                    <Link
                      href="/recipes/new"
                      className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
                    >
                      + Create Recipe
                    </Link>
                  </div>

                  {err && (
                    <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-700">
                      {err}
                    </div>
                  )}
                  {loading && (
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 text-sm text-zinc-700 shadow-sm backdrop-blur">
                      Loading your recipes...
                    </div>
                  )}

                  {!loading && recipes.length === 0 && (
                    <div className="rounded-3xl border border-black/10 bg-white/70 p-6 text-center shadow-sm backdrop-blur">
                      <div className="text-lg font-black text-zinc-900">
                        No recipes yet
                      </div>
                      <p className="mt-1 text-sm text-zinc-700">
                        Click “Create Recipe” to add your first recipe.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur"
                      >
                        <div className="text-base font-extrabold text-zinc-900">
                          {r.title}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-700">
                          <Badge>{r.cuisine_type || "—"}</Badge>
                          <Badge>{r.difficulty || "—"}</Badge>
                          <Badge>Cook {r.cook_time_min ?? 0}m</Badge>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm text-zinc-700">
                          {r.description?.trim()
                            ? r.description
                            : "No description"}
                        </p>

                        <div className="mt-4 flex justify-end gap-2">
                          <Link
                            href={`/recipes/${r.id}`}
                            className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
                          >
                            View
                          </Link>
                          {/* <Link
                            href={`/recipes/${r.id}/edit`}
                            className="rounded-2xl bg-zinc-900 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-black"
                          >
                            Edit
                          </Link> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
