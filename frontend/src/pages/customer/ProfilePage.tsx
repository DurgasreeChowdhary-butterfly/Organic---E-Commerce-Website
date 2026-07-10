import { useState } from "react";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";
import { CURRENT_USER } from "@/data/orders";

export default function ProfilePage() {
  const [name, setName] = useState(CURRENT_USER.full_name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [phone, setPhone] = useState(CURRENT_USER.phone);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Profile" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">My Profile</h1>

      <div className="rounded-3xl bg-white shadow-soft p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-forest-700 text-white flex items-center justify-center text-xl font-semibold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-forest-700">{name}</p>
            <p className="text-xs text-brown-500">{CURRENT_USER.is_verified ? "Verified Account" : "Not Verified"}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
              <User className="w-4 h-4 text-brown-500" />
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full outline-none text-sm bg-transparent" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
              <Mail className="w-4 h-4 text-brown-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full outline-none text-sm bg-transparent" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Phone</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
              <Phone className="w-4 h-4 text-brown-500" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full outline-none text-sm bg-transparent" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700 mb-1.5 block">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-beige px-4 py-3 focus-within:border-pista-500">
              <Lock className="w-4 h-4 text-brown-500" />
              <input type="password" value="••••••••" readOnly className="w-full outline-none text-sm bg-transparent text-brown-500" />
              <button type="button" className="text-xs font-semibold text-pista-700 shrink-0">Change</button>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            {saved && <span className="text-xs text-pista-700 font-semibold">Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
