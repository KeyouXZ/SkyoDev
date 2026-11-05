/**
 * Shared SWR fetcher. Throws on non-2xx so SWR surfaces the error,
 * and unwraps the JSON body.
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/** Default SWR options shared across the app (mirrors SKT's setup). */
export const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 30000,
} as const;
