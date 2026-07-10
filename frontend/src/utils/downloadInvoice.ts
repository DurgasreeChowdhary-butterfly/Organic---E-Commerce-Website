import type { DummyOrder } from "@/data/orders";
import { STATUS_LABEL } from "@/data/orders";
import { formatCurrency } from "./formatCurrency";

/**
 * Generates a plain-text invoice for a dummy order and triggers a browser
 * download. There's no backend/PDF service yet, so this produces a real
 * downloadable file client-side rather than a dead "Download" button.
 */
export function downloadInvoice(order: DummyOrder) {
  const lines = [
    `PRAKRUTI ORGANICS — INVOICE`,
    `Order: ${order.order_number}`,
    `Placed: ${new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    `Status: ${STATUS_LABEL[order.status]}`,
    ``,
    `Ship To:`,
    `${order.address.label} — ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
    ``,
    `Items:`,
    ...order.items.map(
      (i) => `  ${i.product.name} x${i.quantity} — ${formatCurrency((i.product.discount_price ?? i.product.price) * i.quantity)}`
    ),
    ``,
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    order.discount > 0 ? `Discount: -${formatCurrency(order.discount)}` : null,
    `GST: ${formatCurrency(order.gst)}`,
    `Shipping: ${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}`,
    `Total: ${formatCurrency(order.total_amount)}`,
    ``,
    `Thank you for shopping with Prakruti Organics.`,
  ].filter((l): l is string => l !== null);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${order.order_number}-invoice.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
