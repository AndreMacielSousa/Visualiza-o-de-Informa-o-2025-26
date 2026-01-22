export const state = {
  metric: "housing_per_1000",
  year: 2021,
  selectedDistricts: new Set(),
  brushedYears: null // [y0, y1] ou null
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  listeners.forEach(fn => fn());
}

export function resetState(defaultYear) {
  state.metric = "housing_per_1000";
  state.year = defaultYear;
  state.selectedDistricts = new Set();
  state.brushedYears = null;
  notify();
}
