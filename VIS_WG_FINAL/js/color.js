const KEY = "vis_accent_color";
const DEFAULT = "#4da3ff";

export function initAccentColor(onChange) {
  const input = document.getElementById("accentColor");
  if (!input) return;

  const saved = localStorage.getItem(KEY) || DEFAULT;

  // aplica ao CSS
  applyAccent(saved);

  // sincroniza o picker
  input.value = normalizeHex(saved);

  input.addEventListener("input", () => {
    const c = normalizeHex(input.value || DEFAULT);
    applyAccent(c);
    localStorage.setItem(KEY, c);
    if (typeof onChange === "function") onChange(c);
  });
}

export function getAccentColor() {
  // lê a variável CSS atual
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-blue")
    .trim() || DEFAULT;
}

function applyAccent(hex) {
  document.documentElement.style.setProperty("--accent-blue", normalizeHex(hex));
}

function normalizeHex(v) {
  const s = (v || "").trim();
  return /^#([0-9a-f]{6})$/i.test(s) ? s : DEFAULT;
}
