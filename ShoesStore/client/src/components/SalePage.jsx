// src/components/SalePage.js
import React, { useEffect, useState, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState("discount");
  const [loading, setLoading] = useState(true);

  // Fetch từ JSON Server
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/products?discountPercent=20&_sort=discount&_order=desc")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Filter theo price
  const filteredProducts = useMemo(
    () => products.filter((p) => typeof p.price === "number" && p.price <= maxPrice),
    [products, maxPrice]
  );

  // Sort theo chọn của user
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "popular":
        return arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case "rating":
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "discount":
      default:
        return arr.sort((a, b) => (b.discount || 0) - (a.discount || 0));
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
          <span>Sale</span>
        </div>
      </section>

      {/* Header */}
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Sale — Up to 30% Off</h1>
          <p className="men-sub">
            Don't miss out on amazing deals! Shop our sale collection and save big on premium footwear.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container men-content">
        {/* Sidebar (tĩnh, filter tạm thời chưa dynamic) */}
        <aside className="men-side">
          <div className="men-card">
            <div className="men-card-top">
              <h3>Filters</h3>
              <button className="link-btn" type="button" onClick={handleClearAll}>Clear All</button>
            </div>

            {/* Price range */}
            <div className="men-block">
              <h4>Price Range</h4>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Filter by maximum price"
              />
              <div className="men-range"><span>$0</span><span>${maxPrice}</span></div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="men-main">
          <div className="men-toolbar">
            <p className="muted">
              {loading ? "Loading products..." : `Showing ${filteredProducts.length} products on sale`}
            </p>
            <div className="men-sort">
              <span className="muted">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="discount">Biggest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="men-grid">
            {!loading && sortedProducts.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>

          <div className="men-load">
            <button className="outline-btn" type="button">Load More Products</button>
          </div>
        </div>
      </section>
    </main>
  );
}
