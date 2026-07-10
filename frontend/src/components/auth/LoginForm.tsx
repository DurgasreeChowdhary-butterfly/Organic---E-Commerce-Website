import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/features/auth/authSlice";
import { CURRENT_USER } from "@/data/orders";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

const ADMIN_EMAIL = "admin@prakruti.com";

/**
 * Email/password login form backed by dummy auth. Any valid email + 6+
 * character password logs in; using admin@prakruti.com grants admin access.
 */
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginValues) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isAdmin = values.email.trim().toLowerCase() === ADMIN_EMAIL;
      dispatch(
        login({
          ...CURRENT_USER,
          email: values.email.trim(),
          full_name: isAdmin ? "Admin" : CURRENT_USER.full_name,
          is_admin: isAdmin,
        })
      );
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? (isAdmin ? "/admin" : "/"), { replace: true });
    }, 800);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
          <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
            <Mail className="w-4 h-4 text-brown-500 shrink-0" />
            <input
              type="email" {...register("email")}
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
              type={showPassword ? "text" : "password"} {...register("password")}
              placeholder="••••••••" className="w-full outline-none text-sm bg-transparent"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="w-4 h-4 text-brown-500" /> : <Eye className="w-4 h-4 text-brown-500" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-semibold text-pista-700 hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>Log In</Button>

        <p className="text-[11px] text-brown-500 text-center">
          Demo: any email + 6-char password logs you in. Use <strong>{ADMIN_EMAIL}</strong> for admin access.
        </p>
      </form>

      <Modal
        open={forgotOpen}
        onClose={() => { setForgotOpen(false); setResetSent(false); }}
        title="Reset your password"
        maxWidth="max-w-sm"
      >
        {resetSent ? (
          <p className="text-sm text-pista-700">A password reset link has been sent (demo only — no email is actually sent).</p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setResetSent(true); }}
            className="space-y-3"
          >
            <p className="text-sm text-brown-500">Enter your email and we'll send you a reset link.</p>
            <input
              type="email" required placeholder="you@email.com"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            <Button type="submit" fullWidth>Send Reset Link</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
