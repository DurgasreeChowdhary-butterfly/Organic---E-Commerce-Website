import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Mail } from "lucide-react";
import { CERTIFICATIONS } from "@/data/misc";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

/** Footer with brand info, quick links, categories, newsletter, and certifications. */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const categories = useAppSelector((s) => s.products.categories);

  return (
    <footer className="mt-10 sm:mt-20">
      <div className="bg-pista-50 py-5 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className="flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-[11px] sm:text-xs font-semibold text-forest-700 shadow-soft">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pista-700" /> {cert}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forest-700 text-cream pt-6 sm:pt-14 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-8 text-xs sm:text-sm mb-5 sm:mb-10">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Leaf className="w-5 h-5 text-gold" />
              <span className="font-display text-lg text-white">Prakruti Organics</span>
            </div>
            <p className="text-pista-100/90 max-w-xs mb-2.5 sm:mb-4">Organic foods, sourced with care from 250+ partner farms, delivered with integrity.</p>
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
                className="flex-1 min-w-0 rounded-full px-3 py-1.5 sm:py-2 text-xs text-forest-700 outline-none"
              />
              <button type="submit" className="rounded-full px-3 py-1.5 sm:py-2 bg-gold text-forest-700 text-xs font-semibold shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && <p className="text-xs text-gold mt-2">Thanks — you're subscribed! 🌿</p>}
          </div>

          <div>
            <div className="font-semibold text-white mb-2 sm:mb-3">Shop</div>
            <div className="space-y-1.5 sm:space-y-2 text-pista-100/80">
              {categories.slice(0, 4).map((c) => (
                <div key={c.id}><Link to={`/products?category=${c.slug}`} className="hover:text-white">{c.name}</Link></div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-2 sm:mb-3">Company</div>
            <div className="space-y-1.5 sm:space-y-2 text-pista-100/80">
              <div><Link to="/about" className="hover:text-white">Our Story</Link></div>
              <div><Link to="/about#farm-partners" className="hover:text-white">Farm Partners</Link></div>
              <div><Link to="/about#certifications" className="hover:text-white">Certifications</Link></div>
              <div><Link to="/contact" className="hover:text-white">Contact</Link></div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-2 sm:mb-3">Support</div>
            <div className="space-y-1.5 sm:space-y-2 text-pista-100/80">
              <div><Link to="/orders" className="hover:text-white">Track Order</Link></div>
              <div><Link to="/returns" className="hover:text-white">Returns</Link></div>
              <div>
                <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999"}?text=${encodeURIComponent("Hi, I'd like help from the Prakruti Organics support team.")}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp Us
                </a>
              </div>
              <div><Link to="/faq" className="hover:text-white">FAQs</Link></div>
            </div>
          </div>
        </div>
        <div className="text-center text-[11px] sm:text-xs pt-3 sm:pt-6 border-t border-white/10 text-pista-300 space-y-1">
          <p>© {new Date().getFullYear()} Prakruti Organics. All rights reserved.</p>
          <p className="text-pista-300/60">Developed by Uptime Smart Solutions</p>
        </div>
      </div>
    </footer>
  );
}
