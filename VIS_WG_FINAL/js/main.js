import { state, subscribe } from "./state.js";

console.log("main.js carregou ✅", state);

subscribe(() => {
  console.log("estado mudou", state);
});
