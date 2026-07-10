import { Link } from "react-router-dom";
import { Leaf, Trash2 } from "lucide-react";
import type { DummyProduct } from "@/data/products";
import QuantityStepper from "@/components/common/QuantityStepper";
import PriceTag from "@/components/common/PriceTag";

interface CartItemRowProps {
  id: string;
  product: DummyProduct;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

/** Single cart line: image, name, quantity stepper, remove button. */
export default function CartItemRow({ id, product, quantity, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-4 py-5 border-b border-beige animate-fade-up">
      <Link
        to={`/products/${product.slug}`}
        className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${product.tint}14 0%, ${product.tint}2A 100%)` }}
      >
        <Leaf className="w-7 h-7 opacity-40" style={{ color: product.tint }} />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${product.slug}`} className="font-medium text-forest-700 hover:text-pista-700 line-clamp-1">
          {product.name}
        </Link>
        <p className="text-xs text-brown-500 mb-2">{product.weight}</p>
        <PriceTag price={product.price} discountPrice={product.discount_price} size="sm" />
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        <QuantityStepper quantity={quantity} onChange={(q) => onQuantityChange(id, q)} max={product.stock_quantity} />
        <button onClick={() => onRemove(id)} className="text-xs text-brown-500 hover:text-red-600 flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}
