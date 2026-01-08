// client/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Header from "./components/user/Header";
import Footer from "./components/user/Footer";
import Hero from "./components/user/Hero";

import HomePage from "./components/user/HomePage";

import WishlistPage from "./components/user/WishlistPage";
import CartPage from "./components/user/CartPage";
import ProductDetail from "./components/user/ProductDetailPage";
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
import ProfilePage from "./components/user/ProfilePage";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import BrandsAdmin from "./components/admin/BrandsAdmin";      // Thêm mới
import CategoriesAdmin from "./components/admin/CategoriesAdmin"; // Thêm mới
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
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Auth (user) */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductsAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            <Route path="/admin/brands" element={<BrandsAdmin />} />
            <Route path="/admin/categories" element={<CategoriesAdmin />} />
        </Route>
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
          <WishlistProvider>
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}