import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/common/Button";
import * as authService from "@/services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** Requests a password reset email via the real /auth/forgot-password API.
 * Always shows the same generic success message, regardless of whether the
 * email is registered — the backend intentionally never reveals that. */
export default function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    setStatus("loading");
    setError(null);
    try {
      await authService.forgotPassword(values.email);
      setStatus("sent");
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setError(detail ?? "Something went wrong. Please try again in a moment.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-pista-50 px-4 py-3 text-sm text-forest-700">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>If an account exists for that email, we&apos;ve sent a password reset link. It expires in 30 minutes.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            type="email"
            {...register("email")}
            onFocus={() => error && setError(null)}
            placeholder="you@email.com"
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={status === "loading"}>
        Send Reset Link
      </Button>
    </form>
  );
}
