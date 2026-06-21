/** Fill / append into the active unified workbench prompt field */
export function appendWorkbenchPrompt(text: string, mode: "append" | "replace" = "append") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("omnimind:fill-prompt", { detail: { text, mode } }),
  );
}
