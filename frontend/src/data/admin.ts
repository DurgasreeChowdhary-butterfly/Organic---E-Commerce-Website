export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joined: string;
  status: "active" | "inactive";
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  { id: "cu1", name: "Ananya Rao", email: "ananya.rao@example.com", phone: "+91 98765 43210", orders: 12, totalSpent: 14280, joined: "Jan 2026", status: "active" },
  { id: "cu2", name: "Karthik Subramanian", email: "karthik.s@example.com", phone: "+91 90000 11223", orders: 7, totalSpent: 8120, joined: "Feb 2026", status: "active" },
  { id: "cu3", name: "Divya Menon", email: "divya.menon@example.com", phone: "+91 99887 76655", orders: 3, totalSpent: 2140, joined: "Apr 2026", status: "active" },
  { id: "cu4", name: "Rohan Verma", email: "rohan.verma@example.com", phone: "+91 91234 56780", orders: 1, totalSpent: 449, joined: "Jun 2026", status: "inactive" },
  { id: "cu5", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98111 22334", orders: 19, totalSpent: 21870, joined: "Nov 2025", status: "active" },
  { id: "cu6", name: "Suresh Kumar", email: "suresh.k@example.com", phone: "+91 97654 32109", orders: 5, totalSpent: 3990, joined: "Mar 2026", status: "active" },
];

// NOTE: `products`/`lowStock` live-fetch from the real backend elsewhere on
// the dashboard; the "Recent Orders" widget now fetches real orders too (see
// AdminDashboardPage.tsx). Revenue/customer figures below stay dummy —
// there's no revenue-reporting or customer-analytics backend yet.
export const DASHBOARD_STATS = {
  revenue: { value: "₹3,26,400", change: "+12.4%", trend: "up" as const },
  orders: { value: "212", change: "+6.1%", trend: "up" as const },
  customers: { value: ADMIN_CUSTOMERS.length.toString(), change: "+3.8%", trend: "up" as const },
  avgOrderValue: { value: "₹1,540", change: "-1.2%", trend: "down" as const },
};

export const REVENUE_TREND = [
  { month: "Jan", revenue: 52000 },
  { month: "Feb", revenue: 61000 },
  { month: "Mar", revenue: 58000 },
  { month: "Apr", revenue: 70000 },
  { month: "May", revenue: 76000 },
  { month: "Jun", revenue: 84000 },
  { month: "Jul", revenue: 91000 },
];
