
"use client";

import AuthGuard from "@/components/AuthGuard";
import { apiFetch, API_BASE } from "@/utils/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Ingredient = { name: string; qty: number; unit: string };

type Step = {
  text: string;
  images?: string[];
  videos?: string[];
};

type Recipe = {
  id: string;
  user_id: string;

  title: string;
  description?: string;

  cuisine_type?: string;
  difficulty?: string;

  prep_time_min?: number;
  cook_time_min?: number;
  servings?: number;

  ingredients: Ingredient[];
  steps: Step[];

  created_at?: string;
  updated_at?: string;
};

type DetailRes = { recipe: Recipe };

function msg(e: unknown) {
  return e instanceof Error ? e.message : "Failed";
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-xs text-zinc-700 backdrop-blur">
      <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="text-sm font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch<DetailRes>(`/api/recipes/${id}`);
      setRecipe(data.recipe);
    } catch (e: unknown) {
      setErr(msg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const heroImage = useMemo(() => {
    const r = recipe;
    if (!r) return null;
    const first = r.steps?.find((s) => (s.images?.length ?? 0) > 0)?.images?.[0];
    return first ? `${API_BASE}${first}` : null;
  }, [recipe]);

  return (
    <AuthGuard>
      <div className="relative overflow-hidden">
        {/* light background like other pages */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl" />
          <div className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-300/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>

        {/* Top actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Back
          </button>

          {recipe && (
            <Link
              href={`/cook/${recipe.id}`}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
            >
              🍳 Start Cooking Mode
            </Link>
          )}
        </div>

        {loading && (
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 text-sm text-zinc-700 shadow-sm backdrop-blur">
            Loading...
          </div>
        )}

        {err && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-700 shadow-sm backdrop-blur">
            {err}
          </div>
        )}

        {!loading && recipe && (
          <div className="space-y-5">
            {/* HERO */}
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur">
              <div className="relative">
                {heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt="Recipe hero"
                    className="h-56 w-full object-cover md:h-80"
                  />
                ) : (
                  <div className="h-56 w-full bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.28),transparent_55%)] md:h-80" />
                )}

                {/* dark overlay for readable title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Complete Recipe
                      </div>

                      <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-4xl">
                        {recipe.title}
                      </h1>

                      <p className="mt-2 max-w-2xl text-sm text-white/90">
                        {recipe.description?.trim() ? recipe.description : "—"}
                      </p>

                      {/* creator */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
                          Creator: {recipe.user_id}
                        </span>
                        {recipe.created_at && (
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
                            Created: {new Date(recipe.created_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                          Prep
                        </div>
                        <div className="text-sm font-extrabold">
                          {recipe.prep_time_min ?? 0}m
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                          Cook
                        </div>
                        <div className="text-sm font-extrabold">
                          {recipe.cook_time_min ?? 0}m
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                          Difficulty
                        </div>
                        <div className="text-sm font-extrabold">
                          {recipe.difficulty || "—"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-white/70">
                          Servings
                        </div>
                        <div className="text-sm font-extrabold">
                          {recipe.servings ?? 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* quick info row under hero */}
              <div className="grid gap-3 p-5 md:grid-cols-3 md:p-7">
                <StatPill label="Cuisine" value={recipe.cuisine_type || "—"} />
                <StatPill label="Updated" value={recipe.updated_at ? new Date(recipe.updated_at).toLocaleString() : "—"} />
                <StatPill label="Recipe ID" value={recipe.id} />
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid gap-5 lg:grid-cols-12">
              {/* Ingredients */}
              <section className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur lg:col-span-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-zinc-900">Ingredients</h3>
                  <span className="text-xs text-zinc-600">
                    {recipe.ingredients?.length ?? 0} items
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {recipe.ingredients?.map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
                    >
                      <span className="font-semibold text-zinc-900">
                        {ing.name}
                      </span>
                      <span className="text-sm font-bold text-zinc-700">
                        {ing.qty} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Steps */}
              <section className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur lg:col-span-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-zinc-900">Steps</h3>
                  <span className="text-xs text-zinc-600">
                    {recipe.steps?.length ?? 0} steps
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {recipe.steps?.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-3xl border border-black/10 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black text-white">
                            {i + 1}
                          </span>
                          <div className="text-sm font-extrabold text-zinc-900">
                            Step {i + 1}
                          </div>
                        </div>

                        {(s.images?.length || s.videos?.length) ? (
                          <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700">
                            Media
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-700">
                        {s.text}
                      </p>

                      {/* Images */}
                      {s.images?.length ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {s.images.map((p, k) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={k}
                              src={`${API_BASE}${p}`}
                              alt={`step-${i}-${k}`}
                              className="h-44 w-full rounded-2xl border border-black/10 object-cover"
                            />
                          ))}
                        </div>
                      ) : null}

                      {/* Videos */}
                      {s.videos?.length ? (
                        <div className="mt-4 grid gap-3">
                          {s.videos.map((p, k) => (
                            <video
                              key={k}
                              controls
                              className="w-full rounded-2xl border border-black/10 bg-black"
                              src={`${API_BASE}${p}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
