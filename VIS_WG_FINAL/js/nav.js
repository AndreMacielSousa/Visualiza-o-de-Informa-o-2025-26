export function initNav() {
  const btn = document.getElementById("menuBtn");
  const drawer = document.getElementById("navDrawer");
  const overlay = document.getElementById("navOverlay");
  const closeBtn = document.getElementById("navClose");

  if (!btn || !drawer || !overlay) return;

  const open = () => {
    document.body.classList.add("nav-open");
    btn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    document.body.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) close();
    else open();
  });

  overlay.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // realça a página ativa
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  drawer.querySelectorAll("a[data-page]").forEach((a) => {
    const p = (a.getAttribute("data-page") || "").toLowerCase();
    if (p === path) a.classList.add("active");
  });

  // fechar ao clicar num link
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}
