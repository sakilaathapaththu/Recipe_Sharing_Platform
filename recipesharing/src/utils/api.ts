import { getToken } from "@/utils/auth";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

type ApiErr = { detail?: string; message?: string };

function isApiErr(v: unknown): v is ApiErr {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.detail === "string" || typeof o.message === "string";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const ct = res.headers.get("content-type") || "";
  const body: unknown = ct.includes("application/json")
    ? ((await res.json()) as unknown)
    : await res.text();

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (typeof body === "string" && body.trim()) msg = body;
    if (isApiErr(body)) msg = body.detail || body.message || msg;
    throw new Error(msg);
  }

  return body as T;
}
