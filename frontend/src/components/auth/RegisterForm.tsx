import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/features/auth/authSlice";

const DUMMY_OTP = "123456";

const detailsSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number").max(15, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type DetailsValues = z.infer<typeof detailsSchema>;

/** Registration form with a dummy OTP verification step (no real backend calls). */
export default function RegisterForm() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [details, setDetails] = useState<DetailsValues | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema) });

  function handleDetailsSubmit(values: DetailsValues) {
    setDetails(values);
    setStep("otp");
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim() !== DUMMY_OTP) {
      setOtpError(`Incorrect OTP. Use ${DUMMY_OTP} for this demo.`);
      return;
    }
    setOtpError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (details) {
        dispatch(
          login({
            id: `u_${Date.now()}`,
            full_name: details.full_name,
            email: details.email,
            phone: details.phone,
            is_verified: true,
            is_admin: false,
          })
        );
      }
      navigate("/");
    }, 800);
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4 animate-fade-up">
        <div className="flex items-center gap-2 rounded-xl bg-pista-50 px-4 py-3 text-sm text-forest-700">
          <ShieldCheck className="w-4 h-4 text-pista-700 shrink-0" />
          We've sent a 6-digit code to your phone (dummy: use <strong>&nbsp;{DUMMY_OTP}</strong>).
        </div>
        <div>
          <label className="text-sm font-medium text-forest-700 mb-1.5 block">Enter OTP</label>
          <input
            value={otp} onChange={(e) => { setOtp(e.target.value); setOtpError(""); }} maxLength={6} required
            placeholder="6-digit code"
            className="w-full rounded-xl border border-beige px-4 py-3 outline-none text-sm tracking-[0.3em] text-center focus:border-pista-500"
          />
          {otpError && <p className="text-xs text-red-600 mt-1.5 text-center">{otpError}</p>}
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>Verify &amp; Create Account</Button>
        <button type="button" onClick={() => setStep("details")} className="w-full text-xs text-brown-500 hover:text-forest-700">
          ← Back to details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleDetailsSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <User className="w-4 h-4 text-brown-500 shrink-0" />
          <input {...register("full_name")} placeholder="Ananya Rao" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="email" {...register("email")} placeholder="you@email.com" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Phone</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Phone className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="tel" {...register("phone")} placeholder="+91 98765 43210" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500 shrink-0" />
          <input type="password" {...register("password")} placeholder="••••••••" className="w-full outline-none text-sm bg-transparent" />
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" fullWidth size="lg">Continue</Button>
    </form>
  );
}
