import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { googleLoginThunk } from "@/features/auth/authSlice";

/** "Continue with Google" button — reuses the same JWT auth flow as
 * email/password login (see googleLoginThunk). Renders even without a real
 * VITE_GOOGLE_CLIENT_ID configured; the sign-in attempt will just fail with
 * a clear error from Google until real credentials are set. */
export default function GoogleLoginButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) return;
    const result = await dispatch(googleLoginThunk(response.credential));
    if (googleLoginThunk.fulfilled.match(result)) {
      const isAdmin = result.payload.user.is_admin;
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? (isAdmin ? "/admin" : "/"), { replace: true });
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-beige" />
        <span className="text-xs text-brown-500">or</span>
        <div className="h-px flex-1 bg-beige" />
      </div>
      <div className="w-full flex justify-center [&>div]:!w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => undefined}
          useOneTap={false}
          width="100%"
          text="continue_with"
        />
      </div>
    </div>
  );
}
