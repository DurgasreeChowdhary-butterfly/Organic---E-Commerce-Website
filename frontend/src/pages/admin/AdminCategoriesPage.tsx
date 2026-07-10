import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import Button from "@/components/common/Button";
import { ADMIN_CATEGORIES } from "@/data/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);

  function toggleStatus(id: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  }

  function remove(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Categories</h1>
          <p className="text-sm text-brown-500">Organize your storefront's product categories.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Add Category</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="rounded-3xl bg-white shadow-soft p-5 animate-fade-up">
            <div className="w-11 h-11 rounded-full bg-pista-50 flex items-center justify-center mb-3">
              <FolderTree className="w-5 h-5 text-pista-700" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-forest-700">{c.name}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-pista-50 text-pista-700" : "bg-beige text-brown-500"}`}>
                {c.status}
              </span>
            </div>
            <p className="text-xs text-brown-500 mb-4">{c.productCount} product{c.productCount !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button className="flex items-center gap-1 text-forest-700 hover:text-pista-700"><Pencil className="w-3.5 h-3.5" /> Edit</button>
              <button onClick={() => toggleStatus(c.id)} className="text-brown-500 hover:text-forest-700">
                {c.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-brown-500 hover:text-red-600 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
