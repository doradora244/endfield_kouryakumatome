export async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load: ${path}`);
  }
  return response.json();
}

export function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toLabel(value) {
  return value == null || value === "" ? "-" : String(value);
}
