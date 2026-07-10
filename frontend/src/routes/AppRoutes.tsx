import { Routes, Route } from "react-router-dom";
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

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminInventoryPage from "@/pages/admin/AdminInventoryPage";

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
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
