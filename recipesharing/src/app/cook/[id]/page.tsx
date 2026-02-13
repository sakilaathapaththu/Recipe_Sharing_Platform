"use client";

import AuthGuard from "@/components/AuthGuard";
import { apiFetch, API_BASE } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Ingredient = { name: string; qty: number; unit: string };
type Step = { text: string; images?: string[]; videos?: string[] };

type Recipe = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
};

type DetailRes = { recipe: Recipe };

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

export default function CookingModePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  // ingredient checklist (client only)
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  // timer
  const [timerSec, setTimerSec] = useState<number>(0);
  const [running, setRunning] = useState(false);

  const step = recipe?.steps?.[stepIdx];

  const stepImage = useMemo(() => {
    const p = step?.images?.[0];
    return p ? `${API_BASE}${p}` : null;
  }, [step]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch<DetailRes>(`/api/recipes/${id}`);
      setRecipe(data.recipe);
      setStepIdx(0);
      setChecked({});
      setTimerSec(0);
      setRunning(false);

      await apiFetch(`/api/cooking/start/${id}`, { method: "POST" });
    } catch (e: unknown) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function fmtTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function markCompleted() {
    try {
      await apiFetch(`/api/cooking/complete/${id}`, { method: "POST" });
      router.push("/profile");
    } catch (e: unknown) {
      setErr(errMsg(e));
    }
  }

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

        {/* Top bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white"
          >
            ← Back
          </button>

          {recipe ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                Step {stepIdx + 1} / {recipe.steps.length}
              </Badge>
              <Badge>Timer: {fmtTime(timerSec)}</Badge>
            </div>
          ) : null}
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
          <>
            <div className="mb-4 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                {recipe.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-700">
                Cooking Mode — focus on one step at a time.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              {/* LEFT: Step focus */}
              <div className="lg:col-span-8">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black text-white">
                        {stepIdx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                          Current Step
                        </div>
                        <div className="text-lg font-black text-zinc-900">
                          Step {stepIdx + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={stepIdx <= 0}
                        onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                      >
                        Prev
                      </button>
                      <button
                        className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={stepIdx >= recipe.steps.length - 1}
                        onClick={() =>
                          setStepIdx((s) =>
                            Math.min(recipe.steps.length - 1, s + 1)
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white">
                    {stepImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stepImage}
                        alt="step"
                        className="h-56 w-full object-cover md:h-72"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-zinc-50 text-sm font-bold text-zinc-500 md:h-72">
                        No step image
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-3xl border border-black/10 bg-white p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Instruction
                    </div>
                    <div className="mt-2 text-lg font-extrabold leading-snug text-zinc-900 md:text-xl">
                      {step?.text || "—"}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="mt-4 rounded-3xl border border-black/10 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                          Timer
                        </div>
                        <div className="mt-1 text-3xl font-black text-zinc-900">
                          {fmtTime(timerSec)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0"
                          onClick={() => setRunning((r) => !r)}
                        >
                          {running ? "Pause" : "Start"}
                        </button>

                        <button
                          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                          onClick={() => {
                            setRunning(false);
                            setTimerSec(0);
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
                        onClick={() => {
                          setRunning(false);
                          setTimerSec(45 * 60);
                        }}
                      >
                        Set 45:00
                      </button>
                      <span className="text-xs text-zinc-600">
                        (use when you reach Step 6)
                      </span>
                    </div>
                  </div>

                  {/* Completion */}
                  {stepIdx === recipe.steps.length - 1 && (
                    <button
                      onClick={markCompleted}
                      className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
                    >
                      ✅ Mark Recipe Completed
                    </button>
                  )}
                </div>
              </div>

              {/* RIGHT: Ingredients checklist */}
              <div className="lg:col-span-4">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Checklist
                      </div>
                      <div className="text-lg font-black text-zinc-900">
                        Ingredients
                      </div>
                    </div>
                    <Badge>{recipe.ingredients.length} items</Badge>
                  </div>

                  <p className="mt-2 text-sm text-zinc-700">
                    Tick ingredients as you measure them.
                  </p>

                  <div className="mt-4 space-y-2">
                    {recipe.ingredients.map((ing, i) => {
                      const isOn = !!checked[i];
                      return (
                        <label
                          key={i}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={(e) =>
                              setChecked((prev) => ({
                                ...prev,
                                [i]: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-black/20"
                          />
                          <span
                            className={
                              "text-sm " +
                              (isOn
                                ? "text-zinc-500 line-through"
                                : "text-zinc-900")
                            }
                          >
                            <span className="font-bold">
                              {ing.qty} {ing.unit}
                            </span>{" "}
                            {ing.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    className="mt-4 w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
                    onClick={() => setChecked({})}
                  >
                    Clear checklist
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
