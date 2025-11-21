import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function MenPage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState("popular");

  // Fetch data từ API
  useEffect(() => {
    fetch("http://localhost:5000/products?gender=men")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Filter products by price
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
      <section className="men-bc">
        <div className="container">
          <a href="/" className="men-bc-link">Home</a>
          <span className="men-bc-sep">›</span>
          <span>Men</span>
        </div>
      </section>

      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Men&apos;s Collection</h1>
          <p className="men-sub">
            Explore our curated selection of men's footwear.
          </p>
        </div>
      </section>

      <section className="container men-content">
        {/* Sidebar */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            {/* Category */}
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

            {/* Price */}
            <div className="men-block">
              <h4>Price Range</h4>
              <input type="range" min="0" max="200" step="10" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/>
              <div className="men-range">
                <span>$0</span>
                <span>${maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">Showing {filteredProducts.length} products</p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
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
            <button className="outline-btn">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
