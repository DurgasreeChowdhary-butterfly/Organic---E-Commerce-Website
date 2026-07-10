import { RefreshCw, ShieldCheck, Clock, Ban } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const POLICY = [
  { icon: Clock, title: "7-Day Return Window", text: "Unopened, unused products can be returned within 7 days of delivery for a full refund." },
  { icon: ShieldCheck, title: "Quality Guarantee", text: "If a product arrives damaged or doesn't match its description, we'll replace it or refund you in full — no questions asked." },
  { icon: RefreshCw, title: "Easy Refund Process", text: "Once your return is received and inspected, refunds are processed to your original payment method within 5–7 business days." },
  { icon: Ban, title: "What's Not Returnable", text: "Opened food items cannot be returned for hygiene reasons unless the product is defective or damaged in transit." },
];

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Returns" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-2">Returns & Refunds</h1>
      <p className="text-sm text-brown-500 mb-8 max-w-md">We want you to love every order. Here's how returns work.</p>

      <div className="space-y-4">
        {POLICY.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="rounded-2xl bg-white shadow-soft p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-pista-50 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-pista-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-forest-700 mb-1">{p.title}</p>
                <p className="text-sm text-brown-500 leading-relaxed">{p.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-brown-500 mt-8">
        To start a return, go to My Account → My Orders, open the relevant order, and use the Download Invoice
        details to reference your order number when contacting support.
      </p>
    </div>
  );
}
