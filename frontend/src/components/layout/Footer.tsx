import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Mail } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { CERTIFICATIONS } from "@/data/misc";
import { useState } from "react";

/** Footer with brand info, quick links, categories, newsletter, and certifications. */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-20">
      <div className="bg-pista-50 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-wrap gap-3 justify-center">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-xs font-semibold text-forest-700 shadow-soft">
              <ShieldCheck className="w-3.5 h-3.5 text-pista-700" /> {cert}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forest-700 text-cream pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm mb-10">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-gold" />
              <span className="font-display text-lg text-white">Prakruti Organics</span>
            </div>
            <p className="text-pista-100/90 max-w-xs mb-4">Organic foods, sourced with care from 250+ partner farms, delivered with integrity.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="flex gap-2 max-w-xs"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-full px-3 py-2 text-xs text-forest-700 outline-none"
              />
              <button type="submit" className="rounded-full px-3 py-2 bg-gold text-forest-700 text-xs font-semibold shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && <p className="text-xs text-gold mt-2">Thanks — you're subscribed! 🌿</p>}
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Shop</div>
            <div className="space-y-2 text-pista-100/80">
              {CATEGORIES.slice(0, 4).map((c) => (
                <div key={c.id}><Link to={`/products?category=${c.slug}`} className="hover:text-white">{c.name}</Link></div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Company</div>
            <div className="space-y-2 text-pista-100/80">
              <div>Our Story</div><div>Farm Partners</div><div>Certifications</div><div>Contact</div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Support</div>
            <div className="space-y-2 text-pista-100/80">
              <div><Link to="/orders" className="hover:text-white">Track Order</Link></div>
              <div>Returns</div>
              <div>WhatsApp Us</div>
              <div>FAQs</div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs pt-6 border-t border-white/10 text-pista-300">
          © {new Date().getFullYear()} Prakruti Organics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
