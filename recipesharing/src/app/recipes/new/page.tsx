"use client";

import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Ingredient = {
  name: string;
  qty: number;
  unit: string;
};

type Step = {
  text: string;
  images: File[];
  videos: File[];
};

function numOr0(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden="true"
    />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs text-zinc-700 backdrop-blur">
      {children}
    </span>
  );
}

export default function NewRecipePage() {
  const router = useRouter();

  // basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Easy"
  );
  const [prepTime, setPrepTime] = useState("0");
  const [cookTime, setCookTime] = useState("0");
  const [servings, setServings] = useState("1");

  // ingredients + steps
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", qty: 1, unit: "pcs" },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { text: "", images: [], videos: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", qty: 1, unit: "pcs" }]);
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateIngredient(i: number, patch: Partial<Ingredient>) {
    setIngredients((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
  }

  function addStep() {
    setSteps((prev) => [...prev, { text: "", images: [], videos: [] }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateStepText(i: number, text: string) {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, text } : s))
    );
  }

  function setStepImages(i: number, files: FileList | null) {
    const list = files ? Array.from(files) : [];
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, images: list } : s))
    );
  }

  function setStepVideos(i: number, files: FileList | null) {
    const list = files ? Array.from(files) : [];
    setSteps((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, videos: list } : s))
    );
  }

  async function submit() {
    setErr("");
    setOk("");

    if (!canSubmit) {
      setErr("Title is required");
      return;
    }

    const cleanIngredients = ingredients
      .map((x) => ({
        name: x.name.trim(),
        qty: Number(x.qty),
        unit: x.unit.trim(),
      }))
      .filter((x) => x.name.length > 0);

    const cleanSteps = steps
      .map((s) => ({
        text: s.text.trim(),
      }))
      .filter((s) => s.text.length > 0);

    if (cleanSteps.length === 0) {
      setErr("Add at least one step");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      fd.append("title", title);
      fd.append("description", description);
      fd.append("cuisine_type", cuisineType);
      fd.append("difficulty", difficulty);
      fd.append("prep_time_min", String(numOr0(prepTime)));
      fd.append("cook_time_min", String(numOr0(cookTime)));
      fd.append("servings", String(Math.max(1, numOr0(servings))));

      fd.append("ingredients_json", JSON.stringify(cleanIngredients));
      fd.append("steps_json", JSON.stringify(cleanSteps));

      steps.forEach((s, stepIdx) => {
        s.images.forEach((file) => {
          fd.append("step_images", file);
          fd.append("step_images_step_idx", String(stepIdx));
        });
        s.videos.forEach((file) => {
          fd.append("step_videos", file);
          fd.append("step_videos_step_idx", String(stepIdx));
        });
      });

      await apiFetch("/api/recipes", {
        method: "POST",
        body: fd,
      });

      setOk("Recipe created!");
      setTimeout(() => router.push("/"), 700);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="relative overflow-hidden">
        {/* Light background like login/register/home */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl" />
          <div className="absolute -bottom-32 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-300/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>

        {/* Header */}
        <div className="mb-5 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Create recipe
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                Create Recipe
              </h2>
              <p className="mt-1 text-sm text-zinc-700">
                Add basic info, ingredients, and steps with images/videos.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>Steps: {steps.length}</Badge>
                <Badge>Ingredients: {ingredients.length}</Badge>
                <Badge>Difficulty: {difficulty}</Badge>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-bold text-zinc-800 transition hover:bg-white/80"
            >
              ← Back
            </button>
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
        </div>

        {/* Basic Info */}
        <section className="mb-5 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-zinc-900">Basic Info</h3>
            <span className="text-xs text-zinc-600">* Title required</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-6">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Cuisine Type
              </label>
              <input
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                placeholder="Sri Lankan, Italian..."
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")
                }
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-fuchsia-200/70"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Servings
              </label>
              <input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                type="number"
                min={1}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Prep (min)
              </label>
              <input
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                type="number"
                min={0}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Cook (min)
              </label>
              <input
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                type="number"
                min={0}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>

            <div className="md:col-span-12">
              <label className="mb-1 block text-xs font-semibold text-zinc-800">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[110px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
              />
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="mb-5 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-zinc-900">Ingredients</h3>
            <button
              type="button"
              onClick={addIngredient}
              className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
            >
              + Add Ingredient
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-6">
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Ingredient
                  </label>
                  <input
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(i, { name: e.target.value })
                    }
                    placeholder="Ingredient name (e.g., Flour)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Qty
                  </label>
                  <input
                    value={ing.qty}
                    onChange={(e) =>
                      updateIngredient(i, { qty: Number(e.target.value) })
                    }
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Qty"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-fuchsia-200/70"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Unit
                  </label>
                  <input
                    value={ing.unit}
                    onChange={(e) =>
                      updateIngredient(i, { unit: e.target.value })
                    }
                    placeholder="cups, tsp, pcs"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                  />
                </div>

                <div className="md:col-span-1 md:flex md:justify-end">
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length <= 1}
                    title="Remove ingredient"
                    className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-3 md:py-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-6 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-zinc-900">Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className="rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-zinc-800 transition hover:bg-white/80"
            >
              + Add Step
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className="rounded-3xl border border-black/10 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black text-white">
                      {i + 1}
                    </span>
                    <div className="text-sm font-extrabold text-zinc-900">
                      Step {i + 1}
                    </div>
                    <Badge>Images: {s.images.length}</Badge>
                    <Badge>Videos: {s.videos.length}</Badge>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    disabled={steps.length <= 1}
                    className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-semibold text-zinc-800">
                    Instruction
                  </label>
                  <textarea
                    value={s.text}
                    onChange={(e) => updateStepText(i, e.target.value)}
                    placeholder="Describe this step clearly..."
                    className="min-h-[110px] w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-black/20 focus:ring-4 focus:ring-indigo-200/70"
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-800">
                      Step Images (multiple)
                    </label>
                    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => setStepImages(i, e.target.files)}
                        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-xl file:border file:border-black/10 file:bg-zinc-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-zinc-800 hover:file:bg-zinc-100"
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      Selected:{" "}
                      <span className="font-semibold text-zinc-900">
                        {s.images.length}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-800">
                      Step Videos (multiple)
                    </label>
                    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                      <input
                        type="file"
                        multiple
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => setStepVideos(i, e.target.files)}
                        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-xl file:border file:border-black/10 file:bg-zinc-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-zinc-800 hover:file:bg-zinc-100"
                      />
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">
                      Selected:{" "}
                      <span className="font-semibold text-zinc-900">
                        {s.videos.length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            <>
              Create Recipe
              <span className="transition group-hover:translate-x-0.5">→</span>
            </>
          )}
        </button>
      </div>
    </AuthGuard>
  );
}
