import { useMemo, useState } from "react";
import { Eye, Search, Users } from "lucide-react";
import { ADMIN_CUSTOMERS } from "@/data/admin";
import { formatCurrency } from "@/utils/formatCurrency";
import EmptyState from "@/components/common/EmptyState";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import { useLoading } from "@/hooks/useLoading";

export default function AdminCustomersPage() {
  const [selected, setSelected] = useState<typeof ADMIN_CUSTOMERS[number] | null>(null);
  const [search, setSearch] = useState("");
  const loading = useLoading(300);

  const filtered = useMemo(
    () => ADMIN_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Customers</h1>
        <p className="text-sm text-brown-500">{ADMIN_CUSTOMERS.length} registered customers.</p>
      </div>

      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs mb-5">
        <Search className="w-4 h-4 text-brown-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
        />
      </div>

      <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige text-left text-brown-500">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            {!loading && (
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-medium text-forest-700">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brown-500">{c.phone}</td>
                    <td className="px-5 py-3 text-forest-700 font-medium">{c.orders}</td>
                    <td className="px-5 py-3 text-forest-700 font-medium">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-5 py-3 text-brown-500">{c.joined}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelected(c)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700 inline-flex" aria-label="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        {loading && <TableRowsSkeleton rows={5} cols={6} />}
        {!loading && filtered.length === 0 && (
          <div className="py-10">
            <EmptyState icon={Users} title="No customers found" description="Try a different search term." />
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-900/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-3xl shadow-glass w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-forest-700 text-white flex items-center justify-center text-lg font-semibold">
                {selected.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-display text-lg text-forest-700">{selected.name}</h2>
                <p className="text-xs text-brown-500">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Total Orders</p><p className="font-semibold text-forest-700">{selected.orders}</p></div>
              <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Total Spent</p><p className="font-semibold text-forest-700">{formatCurrency(selected.totalSpent)}</p></div>
              <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Phone</p><p className="font-semibold text-forest-700">{selected.phone}</p></div>
              <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Joined</p><p className="font-semibold text-forest-700">{selected.joined}</p></div>
            </div>
            <button onClick={() => setSelected(null)} className="w-full rounded-full py-2.5 text-sm font-semibold bg-forest-700 text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
