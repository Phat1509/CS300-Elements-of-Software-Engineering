// src/components/MenPage.js
import React from "react";
import ProductCard from "./ProductCard";

const menProducts = [
  {
    id: 201,
    name: "Ultra Boost Performance",
    price: 159.99,
    originalPrice: 189.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1080&auto=format&fit=crop",
    rating: 4.9,
    reviews: 418,
    category: "Running",
  },
  {
    id: 202,
    name: "Speed Sprint Elite",
    price: 119.99,
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1080&auto=format&fit=crop",
    rating: 4.8,
    reviews: 245,
    category: "Running",
    discount: 20,
  },
  {
    id: 203,
    name: "Cloud Runner Pro",
    price: 139.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1080&auto=format&fit=crop",
    rating: 4.7,
    reviews: 328,
    category: "Running",
  },
  // 👉 Dán tiếp các item 204..212 từ Figma của bạn vào đây
];

export default function MenPage() {
  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Men</span>
        </div>
      </section>

      {/* Page header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Men&apos;s Collection</h1>
          <p className="men-sub">
            Explore our curated selection of men's footwear. From athletic performance to
            sophisticated style, find your perfect fit.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar (tĩnh để đúng layout hình 2) */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button">Clear All</button>
            </div>

            <div className="men-block">
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Running","Athletic","Casual","Basketball","Dress Shoes","Boots"].map(c=>(
                  <label key={c} className="men-check">
                    <input type="checkbox" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Price Range</h4>
              <input type="range" min="0" max="200" step="10" />
              <div className="men-range">
                <span>$0</span><span>$200</span>
              </div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["8","8.5","9","9.5","10","10.5","11","11.5","12"].map(s=>(
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="men-main">
          {/* Toolbar */}
          <div className="men-toolbar">
            <p className="muted">Showing {menProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select defaultValue="popular">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="men-grid">
            {menProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>

          {/* Load more */}
          <div className="men-load">
            <button className="outline-btn" type="button">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
