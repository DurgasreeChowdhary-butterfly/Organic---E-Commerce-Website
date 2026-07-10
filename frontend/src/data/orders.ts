import type { Address, Order, OrderStatus, User } from "@/types";
import { PRODUCTS } from "./products";

export const CURRENT_USER: User = {
  id: "u1",
  full_name: "Ananya Rao",
  email: "ananya.rao@example.com",
  phone: "+91 98765 43210",
  is_verified: true,
  is_admin: false,
};

export const ADDRESSES: Address[] = [
  {
    id: "addr1", label: "Home",
    line1: "402, Willow Residency, 4th Cross",
    line2: "Indiranagar",
    city: "Bengaluru", state: "Karnataka", pincode: "560038",
    is_default: true,
  },
  {
    id: "addr2", label: "Office",
    line1: "Prestige Tech Park, Tower 3, 6th Floor",
    line2: "Kadubeesanahalli",
    city: "Bengaluru", state: "Karnataka", pincode: "560103",
    is_default: false,
  },
];

interface DummyOrderItem {
  product: typeof PRODUCTS[number];
  quantity: number;
}

export interface DummyOrder extends Order {
  items: DummyOrderItem[];
  address: Address;
  subtotal: number;
  gst: number;
  shipping: number;
  discount: number;
  timeline: { status: OrderStatus; date: string; done: boolean }[];
}

const STATUS_FLOW: OrderStatus[] = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

function buildTimeline(current: OrderStatus): DummyOrder["timeline"] {
  const idx = STATUS_FLOW.indexOf(current);
  return STATUS_FLOW.map((status, i) => ({
    status,
    date: i <= idx ? `Jul ${5 + i}, 2026` : "",
    done: i <= idx,
  }));
}

export const ORDERS: DummyOrder[] = [
  {
    id: "o1", order_number: "PRK-100231", status: "delivered", total_amount: 1247,
    created_at: "2026-07-01T10:30:00Z",
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[4], quantity: 2 }],
    address: ADDRESSES[0], subtotal: 1197, gst: 60, shipping: 0, discount: 50,
    timeline: buildTimeline("delivered"),
  },
  {
    id: "o2", order_number: "PRK-100255", status: "out_for_delivery", total_amount: 928,
    created_at: "2026-07-06T14:15:00Z",
    items: [{ product: PRODUCTS[3], quantity: 1 }, { product: PRODUCTS[2], quantity: 1 }],
    address: ADDRESSES[0], subtotal: 828, gst: 41, shipping: 59, discount: 0,
    timeline: buildTimeline("out_for_delivery"),
  },
  {
    id: "o3", order_number: "PRK-100270", status: "confirmed", total_amount: 638,
    created_at: "2026-07-08T09:05:00Z",
    items: [{ product: PRODUCTS[7], quantity: 1 }, { product: PRODUCTS[9], quantity: 1 }],
    address: ADDRESSES[1], subtotal: 588, gst: 30, shipping: 0, discount: 20,
    timeline: buildTimeline("confirmed"),
  },
  {
    id: "o4", order_number: "PRK-099984", status: "cancelled", total_amount: 449,
    created_at: "2026-06-22T18:40:00Z",
    items: [{ product: PRODUCTS[0], quantity: 1 }],
    address: ADDRESSES[0], subtotal: 449, gst: 0, shipping: 0, discount: 0,
    timeline: buildTimeline("confirmed"),
  },
];

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
