import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Typed wrappers around react-redux hooks for use throughout the app.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
