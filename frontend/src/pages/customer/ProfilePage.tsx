import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Lock, Save, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, updateProfileThunk } from "@/features/auth/authSlice";

const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number").max(15, "Enter a valid phone number"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Enter your current password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, status, error } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function onSave(values: ProfileValues) {
    const result = await dispatch(updateProfileThunk(values));
    if (updateProfileThunk.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function onChangePassword() {
    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setPasswordOpen(false);
      resetPassword();
    }, 1200);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Profile" }]} />
      <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mb-3 sm:mb-6">My Profile</h1>

      <div className="rounded-3xl bg-white shadow-soft p-4 sm:p-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-forest-700 text-white flex items-center justify-center text-base sm:text-xl font-semibold">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-forest-700 text-sm sm:text-base">{user.full_name}</p>
            <p className="text-xs text-brown-500">{user.is_verified ? "Verified Account" : "Not Verified"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-2.5 sm:space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-3.5 py-2.5 sm:px-4 sm:py-3 focus-within:border-pista-500">
              <User className="w-4 h-4 text-brown-500 shrink-0" />
              <input {...register("full_name")} onFocus={() => error && dispatch(clearAuthError())} className="w-full outline-none text-sm bg-transparent" />
            </div>
            {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-3.5 py-2.5 sm:px-4 sm:py-3 focus-within:border-pista-500">
              <Mail className="w-4 h-4 text-brown-500 shrink-0" />
              <input type="email" {...register("email")} className="w-full outline-none text-sm bg-transparent" />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Phone</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-3.5 py-2.5 sm:px-4 sm:py-3 focus-within:border-pista-500">
              <Phone className="w-4 h-4 text-brown-500 shrink-0" />
              <input {...register("phone")} className="w-full outline-none text-sm bg-transparent" />
            </div>
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-3.5 py-2.5 sm:px-4 sm:py-3 focus-within:border-pista-500">
              <Lock className="w-4 h-4 text-brown-500 shrink-0" />
              <input type="password" value="••••••••" readOnly className="w-full outline-none text-sm bg-transparent text-brown-500" />
              <button type="button" onClick={() => setPasswordOpen(true)} className="text-xs font-semibold text-pista-700 shrink-0 hover:underline">Change</button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" icon={<Save className="w-4 h-4" />} loading={status === "loading"}>Save Changes</Button>
            {saved && <span className="text-xs text-pista-700 font-semibold">Saved!</span>}
          </div>
        </form>
      </div>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password" maxWidth="max-w-sm">
        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-3" noValidate>
          <div>
            <input type="password" {...registerPassword("currentPassword")} placeholder="Current password" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {passwordErrors.currentPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <input type="password" {...registerPassword("newPassword")} placeholder="New password" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {passwordErrors.newPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <input type="password" {...registerPassword("confirmPassword")} placeholder="Confirm new password" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {passwordErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" fullWidth loading={passwordSaved}>{passwordSaved ? "Updated!" : "Update Password"}</Button>
        </form>
      </Modal>
    </div>
  );
}
