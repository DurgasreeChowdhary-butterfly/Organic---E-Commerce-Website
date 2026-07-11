import type { Store } from "@reduxjs/toolkit";

/**
 * Late-bound handle to the Redux store, for modules outside the React
 * tree (like apiClient's interceptors) that need `getState`/`dispatch`
 * without creating an import cycle back through `@/store` ->
 * `features/auth/authSlice` -> `services/authService` -> `apiClient`.
 * `store/index.ts` calls `registerStore(store)` right after creating it.
 */
let currentStore: Store | null = null;

export function registerStore(store: Store) {
  currentStore = store;
}

export function getStore(): Store {
  if (!currentStore) {
    throw new Error("Redux store accessed before registerStore() was called");
  }
  return currentStore;
}
