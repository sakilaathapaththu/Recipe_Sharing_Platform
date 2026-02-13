"use client";

import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/utils/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RecipeListItem = {
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

type ListRes = {
  items: RecipeListItem[];
  total: number;
  skip: number;
  limit: number;
};

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Failed";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs text-zinc-700 backdrop-blur">
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="h-5 w-2/3 animate-pulse rounded bg-black/10" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-black/10" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-black/10" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-black/10" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-7 w-20 animate-pulse rounded-full bg-black/10" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-black/10" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-black/10" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [maxTime, setMaxTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState<RecipeListItem[]>([]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cuisine.trim()) p.set("cuisine", cuisine.trim());
    if (difficulty.trim()) p.set("difficulty", difficulty.trim());
    if (maxTime.trim()) p.set("max_time", maxTime.trim());
    p.set("skip", "0");
    p.set("limit", "24");
    return p.toString();
  }, [q, cuisine, difficulty, maxTime]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch<ListRes>(`/api/recipes?${queryString}`);
      setItems(data.items || []);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const activeFilters =
    (q.trim() ? 1 : 0) +
    (cuisine.trim() ? 1 : 0) +
    (difficulty.trim() ? 1 : 0) +
    (maxTime.trim() ? 1 : 0);

  return (
    <AuthGuard>
      <div className="relative overflow-hidden">
        {/* Light background like login/register */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl" />
          <div className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-300/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Browse & discover
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                Browse Recipes
              </h1>
              <p className="mt-1 text-sm text-zinc-700">
                Search & filter recipes. Click one to view details.
              </p>

              {activeFilters > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{activeFilters} filter(s) active</Badge>
                  {q.trim() && <Badge>Search: {q.trim()}</Badge>}
                  {cuisine.trim() && <Badge>Cuisine: {cuisine.trim()}</Badge>}
                  {difficulty.trim() && <Badge>Difficulty: {difficulty.trim()}</Badge>}
                  {maxTime.trim() && <Badge>Max time: {maxTime.trim()}m</Badge>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCuisine("");
                  setDifficulty("");
                  setMaxTime("");
                }}
                className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
              >
                Reset filters
              </button>

              <Link
                href="/recipes/new"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
              >
                + Create Recipe
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-3 rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search recipes (title/description)..."
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Cuisine
              </label>
              <input
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g., Sri Lankan"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-fuchsia-200/70"
              >
                <option value="">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Max cook time
              </label>
              <input
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                placeholder="min"
                type="number"
                min={0}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>
          </div>

          {/* States */}
          {err && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700">
              {err}
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loading && items.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white">
                    🔎
                  </div>
                  <div className="text-lg font-black text-zinc-900">
                    No recipes found
                  </div>
                  <p className="mt-1 text-sm text-zinc-700">
                    Try changing search/filters.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setQ("");
                        setCuisine("");
                        setDifficulty("");
                        setMaxTime("");
                      }}
                      className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading &&
              items.map((r) => (
                <Link
                  key={r.id}
                  href={`/recipes/${r.id}`}
                  className="group rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-black/20 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-zinc-900">
                        {r.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-700">
                        <span className="rounded-full border border-black/10 bg-white/70 px-2 py-1">
                          {r.cuisine_type || "—"}
                        </span>
                        <span className="opacity-50">•</span>
                        <span className="rounded-full border border-black/10 bg-white/70 px-2 py-1">
                          {r.difficulty || "—"}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full border border-black/10 bg-white/70 px-2 py-1 text-xs text-zinc-800">
                      View →
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-zinc-700">
                    {r.description?.trim() ? r.description : "No description"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>Prep: {r.prep_time_min ?? 0}m</Badge>
                    <Badge>Cook: {r.cook_time_min ?? 0}m</Badge>
                    <Badge>Servings: {r.servings ?? 1}</Badge>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
