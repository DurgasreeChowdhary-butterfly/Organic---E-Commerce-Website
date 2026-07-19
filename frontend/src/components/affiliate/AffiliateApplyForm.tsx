import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Lock, Mail, Megaphone, Phone, User as UserIcon } from "lucide-react";
import Button from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyAffiliateThunk } from "@/features/affiliate/affiliateSlice";

const guestSchema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().min(10, "Enter a valid phone number").max(15, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type GuestValues = z.infer<typeof guestSchema>;

const INTRO = {
  title: "Earn commission promoting Prakruti Organics",
  body: "Get your own referral link, share it anywhere, and earn a commission on every order placed through it — once your application is approved.",
};

/**
 * Public "Become an Affiliate" form. Renders two very different flows off
 * the same submit target (POST /affiliate/apply):
 *  - Logged-in customer: no fields, just a one-click "convert my account"
 *    confirmation (password is never re-asked for an existing session).
 *  - Anonymous visitor: full name/email/phone/password/confirm — creates
 *    the account and the affiliate application in a single request.
 */
export default function AffiliateApplyForm() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const { status, error } = useAppSelector((s) => s.affiliate);
  const loading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestValues>({ resolver: zodResolver(guestSchema) });

  async function onGuestSubmit(values: GuestValues) {
    await dispatch(applyAffiliateThunk(values));
  }

  async function handleLoggedInApply() {
    await dispatch(applyAffiliateThunk({}));
  }

  if (isAuthenticated) {
    return (
      <div className="text-center">
        <Megaphone className="w-10 h-10 text-pista-700 mx-auto mb-3" />
        <h2 className="font-display text-lg text-forest-700 mb-2">{INTRO.title}</h2>
        <p className="text-sm text-brown-500 max-w-md mx-auto mb-1">
          Applying as <span className="font-semibold text-forest-700">{user?.full_name}</span> ({user?.email})
        </p>
        <p className="text-sm text-brown-500 max-w-md mx-auto mb-5">{INTRO.body}</p>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4 max-w-md mx-auto text-left">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Button onClick={handleLoggedInApply} loading={loading}>Apply to Become an Affiliate</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <Megaphone className="w-10 h-10 text-pista-700 mx-auto mb-3" />
        <h2 className="font-display text-lg text-forest-700 mb-2">{INTRO.title}</h2>
        <p className="text-sm text-brown-500 max-w-md mx-auto">{INTRO.body}</p>
      </div>

      <form onSubmit={handleSubmit(onGuestSubmit)} className="space-y-4 max-w-md mx-auto text-left" noValidate>
        <div>
          <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
          <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
            <UserIcon className="w-4 h-4 text-brown-500 shrink-0" />
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
            <input type="tel" {...register("phone")} placeholder="9876543210" className="w-full outline-none text-sm bg-transparent" />
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

        <div>
          <label className="text-sm font-medium text-forest-700 mb-1.5 block">Confirm Password</label>
          <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
            <Lock className="w-4 h-4 text-brown-500 shrink-0" />
            <input type="password" {...register("confirm_password")} placeholder="••••••••" className="w-full outline-none text-sm bg-transparent" />
          </div>
          {errors.confirm_password && <p className="text-xs text-red-600 mt-1">{errors.confirm_password.message}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>Submit Application</Button>

        <p className="text-xs text-brown-500 text-center">
          Already have an account? Log in first, then come back here — no need to re-enter a password.
        </p>
      </form>
    </div>
  );
}
