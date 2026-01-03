// client/src/App.js 
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/user/Header";
import Footer from "./components/user/Footer";
import Hero from "./components/user/Hero";
import HomePage from "./components/user/HomePage";
import MenPage from "./components/user/MenPage";
import WomenPage from "./components/user/WomenPage";
import KidsPage from "./components/user/KidsPage";
import SalePage from "./components/user/SalePage";
import WishlistPage from "./components/user/WishlistPage";
import CartPage from "./components/user/CartPage";
import ProductDetailPage from "./components/user/ProductDetailPage";
import NewArrivalsPage from "./components/user/NewArrivalsPage";
import SignInPage from "./components/user/SignInPage";
import SignUpPage from "./components/user/SignUpPage";
import LegalPage from "./components/user/LegalPage";
import OrderHistoryPage from "./components/user/OrderHistoryPage";
import OrderDetailPage from "./components/user/OrderDetailPage";

import AdminDashboard from "./components/admin/AdminDashboard";
import ProductsAdmin from "./components/admin/ProductsAdmin";
import OrdersAdmin from "./components/admin/OrdersAdmin";
import AdminLogin from "./components/admin/AdminLogin";
import RequireAdmin from "./components/admin/RequireAdmin";

import "./App.css";

/** Wrap routes so we can use useLocation inside BrowserRouter */
function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <HomePage />
            </>
          }
        />

        {/* User pages */}
        <Route path="/new" element={<NewArrivalsPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        {/* Auth (user) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <ProductsAdmin />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <OrdersAdmin />
            </RequireAdmin>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}