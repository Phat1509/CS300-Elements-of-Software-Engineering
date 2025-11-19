// src/components/WomenPage.js
import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function WomenPage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch từ API
  useEffect(() => {
    fetch("http://localhost:5000/womenProducts")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Filter products theo giá
  const filteredProducts = useMemo(
    () => products.filter(p => p.isActive && p.price <= maxPrice),
    [products, maxPrice]
  );

  // Sort products
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

  const handleClearAll = () => setMaxPrice(200);

  return (
    <main className="men-wrap">
      {/* Breadcrumb */}
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Women</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Women&apos;s Collection</h1>
          <p className="men-sub">
            Discover elegant and comfortable footwear designed for the modern woman.
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
              <h4>Category</h4>
              <div className="men-checks">
                {["All","Heels","Sneakers","Boots","Athletic","Running","Casual","Lifestyle"].map(c => (
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
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="men-range"><span>$0</span><span>${maxPrice}</span></div>
            </div>

            <div className="men-block">
              <h4>Size (US)</h4>
              <div className="men-sizes">
                {["5","5.5","6","6.5","7","7.5","8","8.5","9"].map(s => (
                  <button key={s} type="button" className="size-btn">{s}</button>
                ))}
              </div>
            </div>

            <div className="men-block">
              <h4>Heel Height</h4>
              <div className="men-checks">
                {["Flat","Low (1-2\")","Mid (2-3\")","High (3-4\")","Very High (4+\")"].map(h => (
                  <label key={h} className="men-check">
                    <input type="checkbox" />
                    <span>{h}</span>
                  </label>
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
