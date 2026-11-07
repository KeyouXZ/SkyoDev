/**
 * UI dictionaries for EN / ID.
 * Keys are flat dot-paths; use `t("dashboard.title")` via PreferencesContext.
 */
import { en } from "./en";
import { id } from "./id";

export type Locale = "en" | "id";

export type Dict = { [key: string]: string | Dict };

export const dictionaries: Record<Locale, Dict> = { en, id };

export function getNested(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (
      cur &&
      typeof cur === "object" &&
      p in (cur as Record<string, unknown>)
    ) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
