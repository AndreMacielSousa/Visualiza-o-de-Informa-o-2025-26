const KEY = "vis_accent_color";
export const DEFAULT_ACCENT = "#4da3ff";

export function initAccentColor(onChange) {
  // ✅ aplica sempre (mesmo se não existir input)
  const saved = localStorage.getItem(KEY) || DEFAULT_ACCENT;
  applyAccent(saved);

  const input = document.getElementById("accentColor");
  if (!input) return;

  input.value = normalizeHex(saved);

  input.addEventListener("input", () => {
    const c = normalizeHex(input.value || DEFAULT_ACCENT);
    setAccentColor(c, true);
    if (typeof onChange === "function") onChange(c);
  });
}

export function getAccentColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-blue")
      .trim() || DEFAULT_ACCENT
  );
}

export function setAccentColor(hex, persist = true) {
  const c = normalizeHex(hex);
  applyAccent(c);

  const input = document.getElementById("accentColor");
  if (input) input.value = c;

  if (persist) localStorage.setItem(KEY, c);
  return c;
}

export function resetAccentColor() {
  localStorage.removeItem(KEY);
  return setAccentColor(DEFAULT_ACCENT, false);
}

function applyAccent(hex) {
  document.documentElement.style.setProperty("--accent-blue", normalizeHex(hex));
}

function normalizeHex(v) {
  const s = (v || "").trim();
  return /^#([0-9a-f]{6})$/i.test(s) ? s : DEFAULT_ACCENT;
}
