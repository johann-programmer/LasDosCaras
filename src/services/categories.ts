import { apiFetch } from "./api";

export function getCategories() {
  return apiFetch("/categories");
}

export function createCategory(name: string) {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}