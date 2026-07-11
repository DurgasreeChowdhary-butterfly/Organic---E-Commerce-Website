import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import HomePage from "@/pages/customer/HomePage";
import ProductListingPage from "@/pages/customer/ProductListingPage";
import ProductDetailPage from "@/pages/customer/ProductDetailPage";
import CartPage from "@/pages/customer/CartPage";
import WishlistPage from "@/pages/customer/WishlistPage";
import CheckoutPage from "@/pages/customer/CheckoutPage";
import LoginPage from "@/pages/customer/LoginPage";
import RegisterPage from "@/pages/customer/RegisterPage";
import OrderHistoryPage from "@/pages/customer/OrderHistoryPage";
import OrderDetailPage from "@/pages/customer/OrderDetailPage";
import AddressBookPage from "@/pages/customer/AddressBookPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import SearchResultsPage from "@/pages/customer/SearchResultsPage";
import NotFoundPage from "@/pages/customer/NotFoundPage";
import AboutPage from "@/pages/customer/AboutPage";
import ContactPage from "@/pages/customer/ContactPage";
import FAQPage from "@/pages/customer/FAQPage";
import ReturnsPage from "@/pages/customer/ReturnsPage";

// Admin pages are only ever loaded by admins — lazy-load them so customer
// visitors (the overwhelming majority) don't download admin table/chart code.
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage"));
const AdminCouponsPage = lazy(() => import("@/pages/admin/AdminCouponsPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"));
const AdminInventoryPage = lazy(() => import("@/pages/admin/AdminInventoryPage"));

function AdminPageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-pista-700" />
    </div>
  );
}

/**
 * Central route table. Customer-facing routes are wrapped in MainLayout
 * (header/footer/whatsapp/chatbot chrome); admin routes use AdminLayout
 * (sidebar dashboard chrome) and are gated by AdminRoute.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/returns" element={<ReturnsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/account/addresses" element={<AddressBookPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={<Suspense fallback={<AdminPageFallback />}><AdminDashboardPage /></Suspense>}
          />
          <Route
            path="/admin/products"
            element={<Suspense fallback={<AdminPageFallback />}><AdminProductsPage /></Suspense>}
          />
          <Route
            path="/admin/categories"
            element={<Suspense fallback={<AdminPageFallback />}><AdminCategoriesPage /></Suspense>}
          />
          <Route
            path="/admin/coupons"
            element={<Suspense fallback={<AdminPageFallback />}><AdminCouponsPage /></Suspense>}
          />
          <Route
            path="/admin/orders"
            element={<Suspense fallback={<AdminPageFallback />}><AdminOrdersPage /></Suspense>}
          />
          <Route
            path="/admin/customers"
            element={<Suspense fallback={<AdminPageFallback />}><AdminCustomersPage /></Suspense>}
          />
          <Route
            path="/admin/inventory"
            element={<Suspense fallback={<AdminPageFallback />}><AdminInventoryPage /></Suspense>}
          />
        </Route>
      </Route>
    </Routes>
  );
}
