import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Droplet, Wheat, Nut, Flame, Truck, ShieldCheck, Sparkles, Star, Mail } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import SectionHeading from "@/components/common/SectionHeading";
import Button from "@/components/common/Button";
import { CATEGORIES, BEST_SELLERS, NEW_ARRIVALS, SEASONAL_PRODUCTS } from "@/data/products";
import { TESTIMONIALS, BANNER_OFFERS, CERTIFICATIONS } from "@/data/misc";

const CATEGORY_ICONS: Record<string, typeof Leaf> = {
  "cold-pressed-oils": Droplet,
  "millets": Wheat,
  "dry-fruits": Nut,
  "spices": Flame,
  "organic-foods": Leaf,
  "natural-products": Sparkles,
};

const HARVEST_RING = [
  { label: "Turmeric", icon: Flame },
  { label: "Millet", icon: Wheat },
  { label: "Almond", icon: Nut },
  { label: "Oil", icon: Droplet },
];

export default function HomePage() {
  const [ringActive, setRingActive] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setRingActive((i) => (i + 1) % HARVEST_RING.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-14 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-forest-700 text-cream mb-5">
            100% Certified Organic
          </span>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.08] text-forest-700 mb-5">
            From soil to home,<br /><span className="text-pista-700">nothing in between.</span>
          </h1>
          <p className="text-base md:text-lg text-brown-500 mb-8 max-w-md">
            Cold-pressed oils, hand-cleaned millets, and stone-ground spices — sourced direct
            from Indian farms and delivered within days of harvest.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/products"><Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>Shop the Harvest</Button></Link>
            <Button size="lg" variant="outline">Our Story</Button>
          </div>
          <div className="flex gap-8 mt-10">
            <div><div className="text-2xl font-display text-forest-700">250+</div><div className="text-xs text-brown-500">Partner Farms</div></div>
            <div><div className="text-2xl font-display text-forest-700">40k+</div><div className="text-xs text-brown-500">Happy Homes</div></div>
            <div><div className="text-2xl font-display text-forest-700">0</div><div className="text-xs text-brown-500">Additives</div></div>
          </div>
        </div>

        <div className="relative flex items-center justify-center animate-float-slow">
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center bg-[radial-gradient(circle,#F3F7E8_0%,#E4EECB_60%,transparent_100%)]">
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-pista-300" />
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-center shadow-glass bg-forest-700">
              <span className="text-[10px] uppercase tracking-widest text-gold">This Season</span>
              <span className="text-white text-sm font-semibold mt-1">{HARVEST_RING[ringActive].label}</span>
            </div>
            {HARVEST_RING.map((item, i) => {
              const angle = (i / HARVEST_RING.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 130;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const Icon = item.icon;
              const active = i === ringActive;
              return (
                <div
                  key={item.label}
                  className="absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-soft"
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${active ? 1.15 : 1})`,
                    background: active ? "#C9A227" : "#fff",
                  }}
                >
                  <Icon className={`w-6 h-6 ${active ? "text-white" : "text-pista-700"}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <SectionHeading eyebrow="Shop by" title="Categories" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? Leaf;
            return (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="rounded-2xl p-5 flex flex-col items-start gap-3 bg-white shadow-soft hover:shadow-glass hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-pista-50">
                  <Icon className="w-5 h-5 text-pista-700" />
                </div>
                <span className="font-semibold text-sm text-forest-700">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Offers banner ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          {BANNER_OFFERS.map((b) => (
            <div key={b.id} className="rounded-3xl p-6 text-white shadow-soft" style={{ background: `linear-gradient(135deg, ${b.tint} 0%, #1F3D2B 130%)` }}>
              <p className="text-xs uppercase tracking-widest text-gold mb-2">Limited Time</p>
              <h3 className="font-display text-xl mb-1">{b.title}</h3>
              <p className="text-sm text-cream/90">{b.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Best Sellers ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <SectionHeading eyebrow="Curated for you" title="Best Sellers" action={{ label: "View all" }} />
        <ProductGrid products={BEST_SELLERS} />
      </section>

      {/* ---------- New Arrivals ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <SectionHeading eyebrow="Just landed" title="New Arrivals" action={{ label: "View all" }} />
        <ProductGrid products={NEW_ARRIVALS} />
      </section>

      {/* ---------- Seasonal ---------- */}
      {SEASONAL_PRODUCTS.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <SectionHeading eyebrow="While it lasts" title="Seasonal Picks" />
          <ProductGrid products={SEASONAL_PRODUCTS} />
        </section>
      )}

      {/* ---------- Why Choose Us ---------- */}
      <section className="py-16 bg-forest-700 mt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl text-center text-cream mb-10">Why households choose Prakruti</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: "Farm Direct", text: "We buy directly from certified organic farms — no middlemen, no markup games." },
              { icon: Droplet, title: "Cold-Pressed, Always", text: "Oils are pressed below 40°C to preserve nutrients and natural aroma." },
              { icon: Truck, title: "Fast, Careful Delivery", text: "Sealed, tamper-proof packaging shipped within 24 hours of your order." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-3xl p-7 bg-white/[0.06]">
                  <Icon className="w-7 h-7 mb-4 text-gold" />
                  <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
                  <p className="text-sm text-pista-100/80">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="font-display text-3xl text-center text-forest-700 mb-10">What our customers say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="rounded-3xl p-6 bg-white shadow-soft">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm italic text-brown-500 mb-4">"{t.quote}"</p>
              <span className="text-sm font-semibold text-forest-700">{t.name}</span>
              <span className="text-xs text-brown-500"> — {t.city}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Certifications + Newsletter ---------- */}
      <section className="py-14 bg-pista-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-wrap gap-4">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert} className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-xs font-semibold text-forest-700 shadow-soft">
                <ShieldCheck className="w-3.5 h-3.5 text-pista-700" /> {cert}
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-8 flex flex-col items-start bg-forest-700">
            <Sparkles className="w-6 h-6 mb-3 text-gold" />
            <h3 className="font-display text-xl mb-2 text-white">Get early access to seasonal harvests</h3>
            <p className="text-sm mb-4 text-pista-100/80">One email a month. No spam, just what's freshly in.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="flex w-full gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none" />
              <button type="submit" className="font-semibold px-5 py-2.5 rounded-full text-sm bg-gold text-forest-700 flex items-center gap-1.5 shrink-0">
                <Mail className="w-3.5 h-3.5" /> Subscribe
              </button>
            </form>
            {subscribed && <p className="text-xs text-gold mt-3">Thanks for subscribing! 🌿</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
