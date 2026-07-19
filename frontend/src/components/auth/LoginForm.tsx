import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button";
import GoogleLoginButton from "./GoogleLoginButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, loginThunk } from "@/features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

/** Email/password login form backed by the real /auth/login API. */
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const loading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    const result = await dispatch(loginThunk(values));
    if (loginThunk.fulfilled.match(result)) {
      const isAdmin = result.payload.user.is_admin;
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? (isAdmin ? "/admin" : "/"), { replace: true });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            type="email" {...register("email")} onFocus={() => error && dispatch(clearAuthError())}
            placeholder="you@email.com" className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            type={showPassword ? "text" : "password"} {...register("password")} onFocus={() => error && dispatch(clearAuthError())}
            placeholder="••••••••" className="w-full outline-none text-sm bg-transparent"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
            {showPassword ? <EyeOff className="w-4 h-4 text-brown-500" /> : <Eye className="w-4 h-4 text-brown-500" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs font-semibold text-pista-700 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>Log In</Button>

      <GoogleLoginButton />
    </form>
  );
}
