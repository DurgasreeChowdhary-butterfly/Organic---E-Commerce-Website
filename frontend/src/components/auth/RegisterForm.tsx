import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button";
import GoogleLoginButton from "./GoogleLoginButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, registerThunk } from "@/features/auth/authSlice";

const detailsSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number").max(15, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type DetailsValues = z.infer<typeof detailsSchema>;

/** Registration form backed by the real /auth/register API. */
export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const loading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema) });

  async function onSubmit(values: DetailsValues) {
    const result = await dispatch(registerThunk(values));
    if (registerThunk.fulfilled.match(result)) {
      navigate("/");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <User className="w-4 h-4 text-brown-500 shrink-0" />
          <input {...register("full_name")} onFocus={() => error && dispatch(clearAuthError())} placeholder="Ananya Rao" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="email" {...register("email")} onFocus={() => error && dispatch(clearAuthError())} placeholder="you@email.com" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Phone</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Phone className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="tel" {...register("phone")} onFocus={() => error && dispatch(clearAuthError())} placeholder="9876543210" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="password" {...register("password")} onFocus={() => error && dispatch(clearAuthError())} placeholder="••••••••" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>

      <GoogleLoginButton />
    </form>
  );
}
