import { formatCurrency } from "@/utils/formatCurrency";
import Button from "@/components/common/Button";
import { ShieldCheck } from "lucide-react";

interface PriceSummaryProps {
  subtotal: number;
  gst?: number;
  shipping?: number;
  discount?: number;
  ctaLabel?: string;
  onCta?: () => void;
  ctaLoading?: boolean;
}

/** Cart/checkout price breakdown: subtotal, GST, discount, shipping, total. */
export default function PriceSummary({ subtotal, gst = 0, shipping = 0, discount = 0, ctaLabel, onCta, ctaLoading }: PriceSummaryProps) {
  const total = subtotal + gst + shipping - discount;

  return (
    <div className="rounded-3xl bg-white shadow-soft p-6 sticky top-24">
      <h3 className="font-display text-lg text-forest-700 mb-4">Price Details</h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-brown-500">
          <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-pista-700">
            <span>Discount</span><span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-brown-500">
          <span>GST</span><span>{gst === 0 ? "Calculated at checkout" : formatCurrency(gst)}</span>
        </div>
        <div className="flex justify-between text-brown-500">
          <span>Shipping</span><span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
        </div>
      </div>
      <div className="border-t border-beige my-4" />
      <div className="flex justify-between text-base font-semibold text-forest-700 mb-5">
        <span>Total</span><span>{formatCurrency(total)}</span>
      </div>
      {ctaLabel && (
        <Button fullWidth size="lg" onClick={onCta} loading={ctaLoading}>{ctaLabel}</Button>
      )}
      <div className="flex items-center gap-2 justify-center mt-4 text-xs text-brown-500">
        <ShieldCheck className="w-3.5 h-3.5 text-pista-700" /> 100% secure checkout
      </div>
    </div>
  );
}
