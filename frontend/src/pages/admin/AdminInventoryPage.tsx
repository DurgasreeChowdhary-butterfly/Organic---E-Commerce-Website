import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, PackageX } from "lucide-react";
import InventoryTable from "@/components/admin/InventoryTable";
import StockAdjustmentModal, { type StockAdjustmentMode } from "@/components/admin/StockAdjustmentModal";
import InventoryHistoryModal from "@/components/admin/InventoryHistoryModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminFetchInventoryThunk,
  adminIncreaseStockThunk,
  adminDecreaseStockThunk,
  adminCorrectStockThunk,
  adminFetchInventoryHistoryThunk,
  clearInventoryError,
  clearInventoryHistory,
} from "@/features/inventory/inventorySlice";
import * as adminService from "@/services/adminService";
import { useDebounce } from "@/hooks/useDebounce";
import type { InventoryItem, StockStatus } from "@/types";

const STATUS_FILTERS: (StockStatus | "all")[] = ["all", "in_stock", "low_stock", "out_of_stock"];
const STATUS_FILTER_LABEL: Record<StockStatus | "all", string> = {
  all: "All",
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export default function AdminInventoryPage() {
  const dispatch = useAppDispatch();
  const { items, total, page, totalPages, status, error, mutatingId, history, historyStatus, historyError, historyPage, historyTotalPages } =
    useAppSelector((s) => s.inventory);
  const categories = useAppSelector((s) => s.products.categories);
  const loading = status === "loading" || status === "idle";

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus | "all">("all");
  const [pageNum, setPageNum] = useState(1);

  const [adjustTarget, setAdjustTarget] = useState<{ item: InventoryItem; mode: StockAdjustmentMode } | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [historyTarget, setHistoryTarget] = useState<InventoryItem | null>(null);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    setPageNum(1);
  }, [debouncedSearch, category, stockStatus]);

  useEffect(() => {
    dispatch(
      adminFetchInventoryThunk({
        search: debouncedSearch || undefined,
        category: category || undefined,
        stock_status: stockStatus === "all" ? undefined : stockStatus,
        page: pageNum,
        page_size: 20,
      })
    );
  }, [dispatch, debouncedSearch, category, stockStatus, pageNum]);

  async function refreshStockSummary() {
    const lowStockItems = await adminService.adminGetLowStock();
    setLowStockCount(lowStockItems.filter((i) => i.stock_status === "low_stock").length);
    setOutOfStockCount(lowStockItems.filter((i) => i.stock_status === "out_of_stock").length);
  }

  useEffect(() => {
    refreshStockSummary();
  }, []);

  function openAdjust(item: InventoryItem, mode: StockAdjustmentMode) {
    setAdjustTarget({ item, mode });
    setModalKey((k) => k + 1);
  }

  function closeAdjust() {
    setAdjustTarget(null);
  }

  async function handleAdjustSubmit(values: { amount: number; reason: string }) {
    if (!adjustTarget) return;
    const { item, mode } = adjustTarget;
    let result;
    if (mode === "increase") {
      result = await dispatch(adminIncreaseStockThunk({ productId: item.id, quantity: values.amount, reason: values.reason }));
    } else if (mode === "decrease") {
      result = await dispatch(adminDecreaseStockThunk({ productId: item.id, quantity: values.amount, reason: values.reason }));
    } else {
      result = await dispatch(adminCorrectStockThunk({ productId: item.id, newQuantity: values.amount, reason: values.reason }));
    }
    if (
      adminIncreaseStockThunk.fulfilled.match(result) ||
      adminDecreaseStockThunk.fulfilled.match(result) ||
      adminCorrectStockThunk.fulfilled.match(result)
    ) {
      closeAdjust();
      refreshStockSummary();
    }
  }

  function openHistory(item: InventoryItem) {
    setHistoryTarget(item);
    dispatch(adminFetchInventoryHistoryThunk({ productId: item.id, page: 1, pageSize: 10 }));
  }

  function closeHistory() {
    setHistoryTarget(null);
    dispatch(clearInventoryHistory());
  }

  function historyPageChange(nextPage: number) {
    if (historyTarget) dispatch(adminFetchInventoryHistoryThunk({ productId: historyTarget.id, page: nextPage, pageSize: 10 }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Inventory</h1>
        <p className="text-sm text-brown-500">Track stock levels and manage adjustments across your catalog.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-3xl bg-white shadow-soft p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-soft-orange/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-soft-orange" />
          </div>
          <div>
            <p className="text-xs text-brown-500">Low Stock Items</p>
            <p className="font-display text-xl text-soft-orange">{lowStockCount}</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-brown-500">Out of Stock Items</p>
            <p className="font-display text-xl text-red-600">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs">
          <Search className="w-4 h-4 text-brown-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
            placeholder="Search by product or SKU..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
          />
          {search && (
            <button onClick={() => setSearchParams({})} aria-label="Clear search">
              <X className="w-3.5 h-3.5 text-brown-500" />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full px-4 py-2.5 bg-white shadow-soft text-sm outline-none cursor-pointer text-forest-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStockStatus(f)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                stockStatus === f ? "bg-forest-700 text-white" : "bg-white text-brown-500 hover:bg-pista-50"
              }`}
            >
              {STATUS_FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => dispatch(clearInventoryError())} className="text-xs font-semibold underline ml-auto shrink-0">Dismiss</button>
        </div>
      )}

      <InventoryTable
        items={items}
        onIncrease={(item) => openAdjust(item, "increase")}
        onDecrease={(item) => openAdjust(item, "decrease")}
        onCorrect={(item) => openAdjust(item, "correct")}
        onHistory={openHistory}
        loading={loading}
      />

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-brown-500">Page {page} of {totalPages} · {total} products</span>
          <button
            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <StockAdjustmentModal
        key={modalKey}
        open={!!adjustTarget}
        mode={adjustTarget?.mode ?? null}
        item={adjustTarget?.item ?? null}
        submitting={mutatingId === adjustTarget?.item.id}
        onClose={closeAdjust}
        onSubmit={handleAdjustSubmit}
      />

      <InventoryHistoryModal
        open={!!historyTarget}
        item={historyTarget}
        transactions={history}
        loading={historyStatus === "loading"}
        error={historyError}
        page={historyPage}
        totalPages={historyTotalPages}
        onPageChange={historyPageChange}
        onClose={closeHistory}
      />
    </div>
  );
}
