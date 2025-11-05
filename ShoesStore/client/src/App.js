import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HomePage from "./components/HomePage";
import MenPage from "./components/MenPage";
import WomenPage from "./components/WomenPage";
import KidsPage from "./components/KidsPage";
import SalePage from "./components/SalePage";
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";
import ProductDetailPage from "./components/ProductDetailPage";
import NewArrivalsPage from "./components/NewArrivalsPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
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
        <Route path="/new" element={<NewArrivalsPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
