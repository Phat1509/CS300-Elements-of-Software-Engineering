// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomePage from "./components/HomePage";
import MenPage from "./components/MenPage";
import WomenPage from "./components/WomenPage"; // <— mới
import KidsPage from "./components/KidsPage";   // <— mới
import SalePage from "./components/SalePage";   // <— mới
import Footer from "./components/Footer";

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
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/sale" element={<SalePage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
