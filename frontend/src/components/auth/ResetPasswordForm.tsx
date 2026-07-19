import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/common/Button";
import * as authService from "@/services/authService";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^\w\s]/, "Include a special character");

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/** Consumes the reset token from the URL (?token=...) and sets a new
 * password via the real /auth/reset-password API. */
export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordValues) {
    setStatus("loading");
    setError(null);
    try {
      await authService.resetPassword(token, values.password);
      setStatus("success");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setError(detail ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 shrink-0" /> This reset link is missing its token. Please request a new one.
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-pista-50 px-4 py-3 text-sm text-forest-700">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>Your password has been reset. Redirecting you to log in&hellip;</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">New Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            onFocus={() => error && setError(null)}
            placeholder="••••••••"
            className="w-full outline-none text-sm bg-transparent"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
            {showPassword ? <EyeOff className="w-4 h-4 text-brown-500" /> : <Eye className="w-4 h-4 text-brown-500" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        <p className="text-xs text-brown-500 mt-1">
          Use 8+ characters with upper &amp; lower case letters, a number, and a symbol.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Confirm Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
            onFocus={() => error && setError(null)}
            placeholder="••••••••"
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={status === "loading"}>
        Reset Password
      </Button>
    </form>
  );
}
