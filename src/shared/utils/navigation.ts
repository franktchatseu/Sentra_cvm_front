import { NavigateFunction, NavigateOptions, To } from "react-router-dom";

/**
 * Determines whether the router has any previous entries to navigate back to.
 * React Router stores the current index on `window.history.state.idx`.
 */
export function hasNavigationHistory(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const historyState = window.history?.state as { idx?: number } | null;
  return typeof historyState?.idx === "number" && historyState.idx > 0;
}

/**
 * Attempts to navigate back using the router history.
 * Falls back to the provided destination when no history entries are available.
 */
export function navigateBackOrFallback(
  navigate: NavigateFunction,
  fallbackTo: To,
  options?: NavigateOptions
): void {
  if (hasNavigationHistory()) {
    navigate(-1);
    return;
  }

  navigate(fallbackTo, options);
}
