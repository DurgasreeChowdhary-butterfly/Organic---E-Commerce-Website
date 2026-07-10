import { useEffect, useState } from "react";

/**
 * Simulates a brief loading state on mount so pages backed by synchronous
 * dummy data still exercise real loading UI (skeletons/spinners).
 */
export function useLoading(delayMs = 400) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return loading;
}
