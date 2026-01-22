import { clamp } from "./utils.js";

const el = document.getElementById("tooltip");

export function hideTooltip() {
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}

export function showTooltip(html, x, y) {
  el.innerHTML = html;

  const pad = 14;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = x + 14;
  let top = y + 14;

  if (left + rect.width + pad > vw) left = x - rect.width - 14;
  if (top + rect.height + pad > vh) top = y - rect.height - 14;

  left = clamp(left, pad, vw - rect.width - pad);
  top = clamp(top, pad, vh - rect.height - pad);

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;

  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");
}
