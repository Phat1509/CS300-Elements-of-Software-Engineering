// src/components/KidsPage.js
import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function KidsPage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch từ API
  useEffect(() => {
    fetch("http://localhost:5000/kidsProducts")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter(p => p.isActive && p.price <= maxPrice),
    [products, maxPrice]
  );

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-low": return arr.sort((a,b)=>a.price-b.price);
      case "price-high": return arr.sort((a,b)=>b.price-a.price);
      case "rating": return arr.sort((a,b)=>(b.rating||0)-(a.rating||0));
      case "newest": return arr.sort((a,b)=>b.id-a.id);
      case "popular":
      default: return arr.sort((a,b)=>(b.reviews||0)-(a.reviews||0));
    }
  }, [filteredProducts, sortBy]);

  const handleClearAll = () => setMaxPrice(100);

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Kids</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Kids&apos; Collection</h1>
          <p className="men-sub">
            Fun and comfortable footwear for active kids. Durable designs that keep up with their adventures.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            <div className="men-block">
              <h4>Age Group</h4>
              <div className="men-checks">
                {["All Ages","Toddler (1-3)","Little Kid (4-7)","Big Kid (8-12)"].map(a=>(
                  <label key={a} className="men-check">
                    <input type="checkbox" />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Running","Athletic","Casual","Basketball","Lifestyle","Boots"].map(c=>(
                  <label key={c} className="men-check">
                    <input type="checkbox" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Price Range</h4>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="men-range"><span>$0</span><span>${maxPrice}</span></div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["10C","11C","12C","13C","1Y","2Y","3Y","4Y","5Y"].map(s=>(
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {filteredProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="men-grid">
            {sortedProducts.map(p => <ProductCard key={p.id} {...p} />)}
          </div>

          <div className="men-load">
            <button className="outline-btn" type="button">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
