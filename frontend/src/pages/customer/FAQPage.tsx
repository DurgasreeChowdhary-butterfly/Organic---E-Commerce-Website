import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import clsx from "clsx";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const FAQS = [
  { q: "How fresh are your products when they ship?", a: "Most items ship within 24–48 hours of harvest or pressing. Oils are cold-pressed in small batches to order wherever possible." },
  { q: "What is your delivery time?", a: "Orders above ₹499 ship free and typically arrive within 2–4 business days, depending on your location." },
  { q: "Can I return a product if I'm not satisfied?", a: "Yes — unopened products can be returned within 7 days of delivery. See our Returns & Refunds page for details." },
  { q: "Are your products certified organic?", a: "Yes, our catalog carries USDA Organic, India Organic, FSSAI, and Non-GMO Verified certifications depending on the product — details are listed on each product page." },
  { q: "How do I track my order?", a: "Go to My Account → My Orders and select the order to see its live status timeline." },
  { q: "Do you ship internationally?", a: "Not yet — we currently deliver only within India." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "FAQs" }]} />
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-6 h-6 text-pista-700" />
        <h1 className="font-display text-2xl md:text-3xl text-forest-700">Frequently Asked Questions</h1>
      </div>
      <p className="text-sm text-brown-500 mb-8">Can't find what you're looking for? Reach out on our Contact page.</p>

      <div className="space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="rounded-2xl bg-white shadow-soft overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-forest-700">{item.q}</span>
                <ChevronDown className={clsx("w-4 h-4 text-brown-500 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-brown-500 leading-relaxed animate-fade-up">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
