import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";

/** Registration form with a dummy OTP verification step (no real backend calls). */
export default function RegisterForm() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("otp");
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/"); }, 800);
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4 animate-fade-up">
        <div className="flex items-center gap-2 rounded-xl bg-pista-50 px-4 py-3 text-sm text-forest-700">
          <ShieldCheck className="w-4 h-4 text-pista-700 shrink-0" />
          We've sent a 6-digit code to your phone (dummy: use <strong>&nbsp;123456</strong>).
        </div>
        <div>
          <label className="text-sm font-medium text-forest-700 mb-1.5 block">Enter OTP</label>
          <input
            value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required
            placeholder="6-digit code"
            className="w-full rounded-xl border border-beige px-4 py-3 outline-none text-sm tracking-[0.3em] text-center focus:border-pista-500"
          />
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>Verify &amp; Create Account</Button>
        <button type="button" onClick={() => setStep("details")} className="w-full text-xs text-brown-500 hover:text-forest-700">
          ← Back to details
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <User className="w-4 h-4 text-brown-500" />
          <input required placeholder="Ananya Rao" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500" />
          <input type="email" required placeholder="you@email.com" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Phone</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Phone className="w-4 h-4 text-brown-500" />
          <input type="tel" required placeholder="+91 98765 43210" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500" />
          <input type="password" required placeholder="••••••••" className="w-full outline-none text-sm bg-transparent" />
        </div>
      </div>
      <Button type="submit" fullWidth size="lg">Continue</Button>
    </form>
  );
}
