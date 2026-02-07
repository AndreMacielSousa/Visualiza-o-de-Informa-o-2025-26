const KEY = "vis_theme"; // "dark" | "light"
export const DEFAULT_THEME = "dark";

export function initTheme() {
  const saved = localStorage.getItem(KEY);
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  const theme = saved || (prefersLight ? "light" : DEFAULT_THEME);
  setTheme(theme, false);

  const btn = document.getElementById("themeBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
      const next = current === "dark" ? "light" : "dark";
      setTheme(next, true);
    });
  }
}

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
}

export function setTheme(theme, persist = true) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  if (persist) localStorage.setItem(KEY, t);
  return t;
}

export function resetTheme() {
  localStorage.removeItem(KEY);
  return setTheme(DEFAULT_THEME, false);
}
