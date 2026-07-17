import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackAffiliateClick } from "@/services/affiliateService";

const STORAGE_KEY = "prakruti_ref";

interface StoredRef {
  code: string;
  ts: number;
}

/** Reads a stored affiliate ref (from a prior `?ref=CODE` visit), or null if
 * none was ever captured. Does not check expiry — the backend re-validates
 * the attribution window server-side against `ts` at checkout time. */
export function getStoredAffiliateRef(): StoredRef | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredRef) : null;
  } catch {
    return null;
  }
}

/**
 * Captures `?ref=CODE` from any landing URL (home page or a product-specific
 * affiliate link) into localStorage — independent of login state, so it
 * survives login/logout/navigation through checkout. Last-touch wins: a
 * fresh `?ref=` overwrites any previously stored one. Runs on every route
 * change since an affiliate link can be the entry point to any page, not
 * just the homepage.
 */
export function useAffiliateTracking(): void {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (!code) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, ts: Date.now() } satisfies StoredRef));
    } catch {
      // localStorage unavailable (private browsing, etc.) — attribution is
      // best-effort, never a hard requirement.
    }
    trackAffiliateClick(code, location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname]);
}
