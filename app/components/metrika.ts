export const YM_COUNTER_ID = 109859892;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }

  window.ym(YM_COUNTER_ID, "reachGoal", goal, params);
}
