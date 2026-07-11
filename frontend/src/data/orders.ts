import type { OrderStatus } from "@/types";

/** Presentational lookup tables for order status — shared by customer and admin order UI. */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "#C9A227",
  confirmed: "#6B8E23",
  packed: "#6B8E23",
  shipped: "#8FA84D",
  out_for_delivery: "#E98A4E",
  delivered: "#1F3D2B",
  cancelled: "#B3261E",
  refunded: "#7A5230",
};

/** The order-status progression used to render the tracking timeline. */
export const STATUS_FLOW: OrderStatus[] = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
