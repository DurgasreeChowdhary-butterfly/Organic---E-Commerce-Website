import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/Button";

/** Email/password login form (dummy — accepts any input and redirects home). */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/"); }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Mail className="w-4 h-4 text-brown-500" />
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com" className="w-full outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
        <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
          <Lock className="w-4 h-4 text-brown-500" />
          <input
            type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" className="w-full outline-none text-sm bg-transparent"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
            {showPassword ? <EyeOff className="w-4 h-4 text-brown-500" /> : <Eye className="w-4 h-4 text-brown-500" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <a className="text-xs font-semibold text-pista-700 hover:underline">Forgot password?</a>
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>Log In</Button>
    </form>
  );
}
